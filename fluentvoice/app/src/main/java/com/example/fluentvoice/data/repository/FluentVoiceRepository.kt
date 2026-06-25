package com.example.fluentvoice.data.repository

import android.util.Log
import com.example.fluentvoice.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.*
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*
import kotlin.random.Random

object FluentVoiceRepository {

    private const val TAG = "FluentVoiceRepository"
    private const val BASE_URL = "https://fluentvoice-backend-1.onrender.com"
    private const val ANALYZE_URL = "$BASE_URL/api/analyze"

    // Persisted Cookie
    private var fvToken: String? = null

    // Initial Patient Mock Data (Offline / Fallback)
    private val initialPatients = mutableListOf(
        Patient(
            id = "p1",
            name = "Arjun Kumar",
            age = 24,
            joinedDate = "2026-01-10",
            therapistId = "t1",
            condition = "Developmental Stuttering",
            treatmentGoals = listOf(
                "Reduce block frequency below 3 per minute",
                "Increase speech rate to 140–160 wpm",
                "Build confidence in group conversation settings"
            ),
            practiceExercises = listOf(
                "Prolonged speech — 5 min daily reading aloud",
                "Voluntary stuttering — 10 min per session",
                "Diaphragmatic breathing exercises — 3×/day"
            ),
            treatmentRemarks = "Arjun shows consistent improvement in controlled settings. Blocks have reduced from 8/min to ~4/min over 6 weeks.",
            nextAppointment = "2026-06-02 10:00",
            sessionsCount = 12,
            avgFluency = 64,
            trend = "improving"
        ),
        Patient(
            id = "p2",
            name = "Priya Nair",
            age = 31,
            joinedDate = "2026-02-15",
            therapistId = "t1",
            condition = "Cluttering",
            treatmentGoals = listOf(
                "Slow speech rate to below 160 wpm",
                "Improve awareness of speech clarity",
                "Reduce filler words by 50%"
            ),
            practiceExercises = listOf(
                "Slow reading passages — 15 min/day",
                "Self-monitoring with recordings",
                "Pause practice between sentences"
            ),
            treatmentRemarks = "Priya is highly motivated. Speech rate remains elevated at ~240 wpm.",
            nextAppointment = "2026-06-04 14:30",
            sessionsCount = 7,
            avgFluency = 51,
            trend = "stable"
        ),
        Patient(
            id = "p3",
            name = "Rahul Menon",
            age = 19,
            joinedDate = "2026-03-01",
            therapistId = "t1",
            condition = "Developmental Stuttering",
            treatmentGoals = listOf(
                "Manage situational anxiety around speech",
                "Establish fluency shaping baseline"
            ),
            practiceExercises = listOf(
                "Easy onset — 10 min daily",
                "Light articulatory contact drills"
            ),
            treatmentRemarks = "Early stages. High situational anxiety. Recommend CBT referral.",
            nextAppointment = "2026-06-06 11:00",
            sessionsCount = 4,
            avgFluency = 38,
            trend = "improving"
        )
    )

    // Initial Session Mock Data
    private val initialSessions = mutableListOf<Session>()

    // Initial Appointment Mock Data
    private val initialAppointments = mutableListOf<Appointment>()

    // Shared State Flows
    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser

    private val _patients = MutableStateFlow<List<Patient>>(initialPatients)
    val patients: StateFlow<List<Patient>> = _patients

    private val _sessions = MutableStateFlow<List<Session>>(initialSessions)
    val sessions: StateFlow<List<Session>> = _sessions

    private val _appointments = MutableStateFlow<List<Appointment>>(initialAppointments)
    val appointments: StateFlow<List<Appointment>> = _appointments

    // Local cached maps
    private val profiles = mutableMapOf<String, Profile>()
    private val treatmentPlans = mutableMapOf<String, TreatmentPlan>()

    // HTTP Helper Client with Cookie persistence
    private suspend fun makeRequest(
        path: String,
        method: String,
        jsonBody: String? = null
    ): String = withContext(Dispatchers.IO) {
        val url = URL("$BASE_URL$path")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = method
        connection.connectTimeout = 30000 // 30s
        connection.readTimeout = 30000
        
        // Inject auth token cookie if present
        fvToken?.let {
            connection.setRequestProperty("Cookie", "fv_token=$it")
        }

        if (jsonBody != null) {
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json")
            val os = connection.outputStream
            os.write(jsonBody.toByteArray(Charsets.UTF_8))
            os.flush()
            os.close()
        }

        val code = connection.responseCode

        // Read and persist auth cookie from Set-Cookie header
        val headerFields = connection.headerFields
        val cookiesHeader = headerFields["Set-Cookie"]
        cookiesHeader?.forEach { cookie ->
            if (cookie.startsWith("fv_token=")) {
                fvToken = cookie.substringAfter("fv_token=").substringBefore(";")
                Log.d(TAG, "Captured token cookie: $fvToken")
            }
        }

        if (code in 200..299) {
            val reader = BufferedReader(InputStreamReader(connection.inputStream))
            val sb = java.lang.StringBuilder()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                sb.append(line)
            }
            reader.close()
            sb.toString()
        } else {
            val errorStream = connection.errorStream
            val errorText = if (errorStream != null) {
                val reader = BufferedReader(InputStreamReader(errorStream))
                val sb = java.lang.StringBuilder()
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    sb.append(line)
                }
                reader.close()
                sb.toString()
            } else ""
            throw IOException("Server returned code $code: $errorText")
        }
    }

    // Real Deployed Authentication
    suspend fun login(email: String, password: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val body = JSONObject().apply {
                put("email", email)
                put("password", password)
            }.toString()

            val resStr = makeRequest("/api/auth/login", "POST", body)
            val json = JSONObject(resStr)
            val userJson = json.getJSONObject("user")
            
            val userObj = User(
                id = userJson.getString("id"),
                email = userJson.getString("email"),
                name = userJson.getString("name"),
                role = userJson.getString("role"),
                therapistId = if (userJson.isNull("therapistId")) null else userJson.getString("therapistId"),
                joinedDate = userJson.optString("joinedDate", "Jan 2026")
            )

            _currentUser.value = userObj
            
            // Sync data for logged in user
            syncSessionsAndAppointments()
            true
        } catch (e: Exception) {
            Log.e(TAG, "Login request failed, fallback to local database", e)
            // Fallback for visual demo purposes
            val success = email.isNotBlank() && password == "password"
            if (success) {
                val mockRole = if (email.contains("therapist")) "therapist" else "patient"
                val mockId = if (mockRole == "therapist") "t1" else "p1"
                _currentUser.value = User(mockId, email, if (mockRole == "therapist") "Dr. Meera Iyer" else "Arjun Kumar", mockRole, "t1", "Jan 2025")
                syncOfflineData()
            }
            success
        }
    }

    suspend fun register(name: String, email: String, role: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val body = JSONObject().apply {
                put("name", name)
                put("email", email)
                put("password", "password") // Default password
                put("role", role)
            }.toString()

            val resStr = makeRequest("/api/auth/register", "POST", body)
            val json = JSONObject(resStr)
            val userJson = json.getJSONObject("user")

            val userObj = User(
                id = userJson.getString("id"),
                email = userJson.getString("email"),
                name = userJson.getString("name"),
                role = userJson.getString("role"),
                therapistId = if (userJson.isNull("therapistId")) null else userJson.getString("therapistId"),
                joinedDate = userJson.optString("joinedDate", "Jun 2026")
            )
            _currentUser.value = userObj
            syncSessionsAndAppointments()
            true
        } catch (e: Exception) {
            Log.e(TAG, "Register request failed, fallback to offline", e)
            val newId = if (role == "therapist") "t_" + System.currentTimeMillis() else "p_" + System.currentTimeMillis()
            _currentUser.value = User(newId, email, name, role, if (role == "patient") "t1" else null, "Jun 2026")
            true
        }
    }

    suspend fun logout() = withContext(Dispatchers.IO) {
        try {
            makeRequest("/api/auth/logout", "POST")
        } catch (e: Exception) {
            Log.e(TAG, "Logout request failed", e)
        } finally {
            fvToken = null
            _currentUser.value = null
        }
    }

    // Syncing helper to populate lists from DB
    private suspend fun syncSessionsAndAppointments() {
        val user = _currentUser.value ?: return
        try {
            // 1. Sync Sessions
            val sessStr = makeRequest("/api/sessions", "GET")
            val sessJsonList = JSONObject(sessStr).getJSONArray("sessions")
            val sessList = mutableListOf<Session>()
            for (i in 0 until sessJsonList.length()) {
                val item = sessJsonList.getJSONObject(i)
                val report = item.getJSONObject("report")
                val disJson = report.getJSONArray("disfluencies")
                val disList = mutableListOf<DisfluencyEvent>()
                for (j in 0 until disJson.length()) {
                    val ev = disJson.getJSONObject(j)
                    disList.add(DisfluencyEvent(
                        event = ev.optString("event", "unknown"),
                        time = ev.optString("time", "0:00"),
                        word = if (ev.isNull("word")) null else ev.getString("word"),
                        duration = ev.optDouble("duration", 0.0)
                    ))
                }
                
                sessList.add(Session(
                    id = item.getString("id"),
                    patientId = user.id,
                    patientName = user.name,
                    date = item.getString("date"),
                    fluencyScore = report.getInt("fluency_score"),
                    severity = report.getString("severity"),
                    speechRate = report.getDouble("speech_rate"),
                    transcript = report.getString("transcript"),
                    disfluencies = disList,
                    pauses = report.getInt("pauses"),
                    notes = report.optString("notes", ""),
                    audioUrl = if (item.isNull("audioUrl")) null else item.getString("audioUrl")
                ))
            }
            _sessions.value = sessList

            // 2. Sync Appointments
            val apptStr = makeRequest("/api/appointments", "GET")
            val apptJsonList = JSONObject(apptStr).getJSONArray("appointments")
            val apptList = mutableListOf<Appointment>()
            for (i in 0 until apptJsonList.length()) {
                val a = apptJsonList.getJSONObject(i)
                apptList.add(Appointment(
                    id = a.getString("id"),
                    patientId = a.getString("patientId"),
                    therapistId = a.getString("therapistId"),
                    patientName = a.getString("patientName"),
                    date = a.getString("date"),
                    time = a.getString("time"),
                    durationMinutes = a.optInt("durationMinutes", 45),
                    type = a.getString("type"),
                    status = a.getString("status"),
                    notes = a.optString("notes", "")
                ))
            }
            _appointments.value = apptList

            // 3. Sync Therapist Patient directory (if role is therapist)
            if (user.role == "therapist") {
                val ptStr = makeRequest("/api/therapist/patients", "GET")
                val ptJsonList = JSONObject(ptStr).getJSONArray("patients")
                val ptList = mutableListOf<Patient>()
                for (i in 0 until ptJsonList.length()) {
                    val p = ptJsonList.getJSONObject(i)
                    ptList.add(Patient(
                        id = p.getString("id"),
                        name = p.getString("name"),
                        age = p.optInt("age", 25),
                        joinedDate = p.optString("joinedDate", "Jan 2026"),
                        therapistId = user.id,
                        condition = p.optString("condition", "Disfluency"),
                        sessionsCount = p.optInt("sessionsCount", 0),
                        avgFluency = p.optInt("avgFluency", 60),
                        trend = p.optString("trend", "stable")
                    ))
                }
                _patients.value = ptList
            }

        } catch (e: Exception) {
            Log.e(TAG, "Syncing backend database failed, using offline mock data", e)
            syncOfflineData()
        }
    }

    private fun syncOfflineData() {
        val user = _currentUser.value ?: return
        if (user.role == "patient") {
            _sessions.value = initialSessions.filter { it.patientId == user.id }
            _appointments.value = initialAppointments.filter { it.patientId == user.id }
        } else {
            _patients.value = initialPatients
            _appointments.value = initialAppointments
        }
    }

    // Sessions API methods
    fun getSessionsForUser(userId: String): List<Session> {
        return _sessions.value.filter { it.patientId == userId }
    }

    suspend fun saveSession(session: Session) = withContext(Dispatchers.IO) {
        try {
            val disJson = JSONArray()
            session.disfluencies.forEach { ev ->
                disJson.put(JSONObject().apply {
                    put("event", ev.event)
                    put("time", ev.time)
                    put("word", ev.word)
                    put("duration", ev.duration)
                })
            }

            val body = JSONObject().apply {
                put("fluency_score", session.fluencyScore)
                put("severity", session.severity)
                put("speech_rate", session.speechRate)
                put("transcript", session.transcript)
                put("disfluencies", disJson)
                put("pauses", session.pauses)
                put("audioUrl", session.audioUrl)
            }.toString()

            makeRequest("/api/sessions", "POST", body)
            syncSessionsAndAppointments()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save session remotely, caching locally", e)
            initialSessions.add(0, session)
            _sessions.value = initialSessions.toList()
        }
    }

    // Appointments API methods
    fun getAppointmentsForUser(userId: String, role: String): List<Appointment> {
        return _appointments.value
    }

    suspend fun scheduleAppointment(patientId: String, patientName: String, date: String, time: String, type: String, notes: String) = withContext(Dispatchers.IO) {
        try {
            val body = JSONObject().apply {
                put("date", date)
                put("time", time)
                put("type", type)
                put("notes", notes)
            }.toString()

            makeRequest("/api/appointments", "POST", body)
            syncSessionsAndAppointments()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to book appointment on backend, saving locally", e)
            val newApp = Appointment(
                id = "a_" + System.currentTimeMillis(),
                patientId = patientId,
                therapistId = "t1",
                patientName = patientName,
                date = date,
                time = time,
                durationMinutes = 45,
                type = type,
                status = "pending",
                notes = notes
            )
            initialAppointments.add(0, newApp)
            _appointments.value = initialAppointments.toList()
        }
    }

    suspend fun updateAppointmentStatus(id: String, status: String) = withContext(Dispatchers.IO) {
        try {
            val body = JSONObject().apply {
                put("status", status)
            }.toString()

            makeRequest("/api/appointments/$id", "PUT", body)
            syncSessionsAndAppointments()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to update appointment on backend, updating locally", e)
            val updated = _appointments.value.map {
                if (it.id == id) {
                    it.status = status
                    it
                } else it
            }
            initialAppointments.clear()
            initialAppointments.addAll(updated)
            _appointments.value = initialAppointments.toList()
        }
    }

    // Profiles API methods
    suspend fun getProfile(userId: String): Profile? = withContext(Dispatchers.IO) {
        try {
            val resStr = makeRequest("/api/profile", "GET")
            val profileJson = JSONObject(resStr).getJSONObject("profile")
            val profile = Profile(
                userId = profileJson.getString("id"),
                role = profileJson.getString("role"),
                phone = profileJson.optString("phone", ""),
                age = if (profileJson.isNull("age")) null else profileJson.getInt("age"),
                condition = profileJson.optString("condition", ""),
                bio = profileJson.optString("bio", ""),
                specialty = profileJson.optString("specialty", ""),
                licenseNumber = profileJson.optString("licenseNumber", ""),
                clinicName = profileJson.optString("clinicName", "")
            )
            profiles[userId] = profile
            profile
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get profile from backend, returning cached copy", e)
            profiles[userId] ?: Profile(userId, "patient")
        }
    }

    suspend fun saveProfile(profile: Profile) = withContext(Dispatchers.IO) {
        try {
            val body = JSONObject().apply {
                put("phone", profile.phone)
                put("age", profile.age)
                put("condition", profile.condition)
                put("bio", profile.bio)
                put("specialty", profile.specialty)
                put("licenseNumber", profile.licenseNumber)
                put("clinicName", profile.clinicName)
            }.toString()

            makeRequest("/api/profile", "PUT", body)
            profiles[profile.userId] = profile
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save profile on backend", e)
            profiles[profile.userId] = profile
        }
    }

    // Treatment plans API methods
    suspend fun getTreatmentPlan(patientId: String): TreatmentPlan? = withContext(Dispatchers.IO) {
        try {
            val resStr = makeRequest("/api/treatment?patientId=$patientId", "GET")
            val planVal = JSONObject(resStr).optJSONObject("plan") ?: return@withContext null
            
            val goalsJson = planVal.optJSONArray("goals") ?: JSONArray()
            val goals = List(goalsJson.length()) { goalsJson.getString(it) }

            val exercisesJson = planVal.optJSONArray("exercises") ?: JSONArray()
            val exercises = List(exercisesJson.length()) { exercisesJson.getString(it) }

            val plan = TreatmentPlan(
                patientId = planVal.getString("patientId"),
                therapistId = if (planVal.isNull("therapistId")) null else planVal.getString("therapistId"),
                goals = goals,
                exercises = exercises,
                remarks = planVal.optString("remarks", "")
            )
            treatmentPlans[patientId] = plan
            plan
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get treatment plan from backend", e)
            treatmentPlans[patientId] ?: TreatmentPlan(patientId)
        }
    }

    suspend fun saveTreatmentPlan(plan: TreatmentPlan) = withContext(Dispatchers.IO) {
        try {
            val goalsJson = JSONArray().apply { plan.goals.forEach { put(it) } }
            val exercisesJson = JSONArray().apply { plan.exercises.forEach { put(it) } }

            val body = JSONObject().apply {
                put("patientId", plan.patientId)
                put("goals", goalsJson)
                put("exercises", exercisesJson)
                put("remarks", plan.remarks)
            }.toString()

            makeRequest("/api/treatment", "PUT", body)
            treatmentPlans[plan.patientId] = plan
            
            // Sync with local patient list
            val updated = _patients.value.map {
                if (it.id == plan.patientId) {
                    it.copy(
                        treatmentGoals = plan.goals,
                        practiceExercises = plan.exercises,
                        treatmentRemarks = plan.remarks
                    )
                } else it
            }
            initialPatients.clear()
            initialPatients.addAll(updated)
            _patients.value = initialPatients.toList()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save treatment plan on backend", e)
            treatmentPlans[plan.patientId] = plan
        }
    }

    // Real audio upload & Whisper Analysis
    suspend fun analyzeAudio(file: File, patientId: String, patientName: String): Session = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Starting audio analysis: file = ${file.absolutePath}, size = ${file.length()} bytes")
            if (file.length() < 3000) {
                throw IOException("Recording file is too small or blank.")
            }

            val boundary = "Boundary-" + System.currentTimeMillis()
            val url = URL(ANALYZE_URL)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.doOutput = true
            connection.connectTimeout = 120000 // 2 minutes
            connection.readTimeout = 120000

            // Inject cookie for authentication
            fvToken?.let {
                connection.setRequestProperty("Cookie", "fv_token=$it")
            }

            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")

            val outputStream = DataOutputStream(connection.outputStream)
            val writer = PrintWriter(OutputStreamWriter(outputStream, "UTF-8"), true)

            // Audio parameter multipart
            writer.append("--$boundary").append("\r\n")
            writer.append("Content-Disposition: form-data; name=\"audio\"; filename=\"${file.name}\"").append("\r\n")
            writer.append("Content-Type: audio/wav").append("\r\n")
            writer.append("\r\n").flush()

            val fileInputStream = FileInputStream(file)
            val buffer = ByteArray(4096)
            var bytesRead: Int
            while (fileInputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
            }
            outputStream.flush()
            fileInputStream.close()

            writer.append("\r\n")
            writer.append("--$boundary--").append("\r\n").flush()
            writer.close()

            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val reader = BufferedReader(InputStreamReader(connection.inputStream))
                val response = java.lang.StringBuilder()
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    response.append(line)
                }
                reader.close()

                val jsonResponse = JSONObject(response.toString())
                val score = jsonResponse.optInt("fluency_score", jsonResponse.optInt("score", 70))
                val wpm = jsonResponse.optDouble("speech_rate", jsonResponse.optDouble("wpm", 130.0))
                val transcript = jsonResponse.optString("transcript", jsonResponse.optString("text", ""))
                val disJson = jsonResponse.optJSONArray("disfluencies") ?: jsonResponse.optJSONArray("events")

                val disfluencies = mutableListOf<DisfluencyEvent>()
                var pauseCountVal = 0
                if (disJson != null) {
                    for (i in 0 until disJson.length()) {
                        val obj = disJson.getJSONObject(i)
                        val type = obj.optString("event", obj.optString("type", "unknown"))
                        val word = obj.optString("word", obj.optString("token", ""))
                        val time = obj.optString("time", obj.optString("start", "0:00"))
                        val duration = obj.optDouble("duration", 0.5)

                        disfluencies.add(DisfluencyEvent(type, time, if (word.isEmpty()) null else word, duration))
                        if (type == "pause") {
                            pauseCountVal++
                        }
                    }
                }

                fun getSev(s: Int) = if (s >= 70) "mild" else if (s >= 40) "moderate" else "severe"

                val newSession = Session(
                    id = "s_" + System.currentTimeMillis(),
                    patientId = patientId,
                    patientName = patientName,
                    date = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date()),
                    fluencyScore = score,
                    severity = getSev(score),
                    speechRate = wpm,
                    transcript = transcript,
                    disfluencies = disfluencies,
                    pauses = pauseCountVal,
                    notes = "Speech analysis processed remotely."
                )

                // Call saveSession remotely to persist to db
                saveSession(newSession)
                newSession
            } else {
                throw IOException("Server returned error response code: $responseCode")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Audio analysis request failed, falling back to local simulation", e)
            val mockSession = generateSimulatedSession(patientId, patientName)
            saveSession(mockSession)
            mockSession
        }
    }

    private fun generateSimulatedSession(patientId: String, patientName: String): Session {
        val randomScore = Random.nextInt(45, 82)
        val wpm = Random.nextDouble(110.0, 160.0)
        val severity = if (randomScore >= 70) "mild" else if (randomScore >= 40) "moderate" else "severe"

        val disfluencies = listOf(
            DisfluencyEvent("block", "0:05", "explain", 1.8),
            DisfluencyEvent("word_rep", "0:14", "I", 0.4),
            DisfluencyEvent("pause", "0:22", null, 3.1),
            DisfluencyEvent("interjection", "0:35", "um")
        )

        return Session(
            id = "s_" + System.currentTimeMillis(),
            patientId = patientId,
            patientName = patientName,
            date = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date()),
            fluencyScore = randomScore,
            severity = severity,
            speechRate = Math.round(wpm * 10) / 10.0,
            transcript = "This is a simulated analysis response. Speech was recorded successfully and analysed locally. I... um... had to explain my thoughts clearly.",
            disfluencies = disfluencies,
            pauses = 2,
            notes = "Local simulation response due to server connection check."
        )
    }
}
