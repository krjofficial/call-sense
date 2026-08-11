const audioFile = document.getElementById("audioFile");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const status = document.getElementById("status");
const results = document.getElementById("results");


// Show selected filename
audioFile.addEventListener("change", () => {

    if (audioFile.files.length === 0) {
        fileName.textContent = "";
        return;
    }

    fileName.textContent = `Selected: ${audioFile.files[0].name}`;
});


// Analyze button
analyzeBtn.addEventListener("click", async () => {

    if (audioFile.files.length === 0) {
        status.textContent = "Please select an audio file first.";
        return;
    }

    const file = audioFile.files[0];

    const formData = new FormData();
    formData.append("file", file);


    // UI loading state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    status.textContent = "Uploading and analyzing your call...";
    results.classList.add("hidden");


    try {

        const response = await fetch("/api/analyze", {
            method: "POST",
            body: formData
        });


        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(
                `Server error (${response.status}): ${errorText}`
            );
        }


        const data = await response.json();

        console.log("API response:", data);


        // Fill dashboard
        displayResults(data);


        status.textContent = "Analysis complete.";

    } catch (error) {

        console.error(error);

        status.textContent =
            "Something went wrong. Check the browser console.";

        alert(error.message);

    } finally {

        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Call";

    }

});


// Display API results
function displayResults(data) {

    const insights = data.insights;


    // Overview
    document.getElementById("sentiment").textContent =
        insights.sentiment;

    document.getElementById("sentimentScore").textContent =
        Number(insights.sentiment_score).toFixed(2);

    document.getElementById("language").textContent =
        insights.detected_language || data.original_language;

    document.getElementById("escalation").textContent =
        insights.escalation_risk ? "High Risk" : "Low Risk";


    // Summary
    document.getElementById("summary").textContent =
        insights.summary;


    // Topics
    const topicsContainer =
        document.getElementById("topics");

    topicsContainer.innerHTML = "";

    if (insights.key_topics.length === 0) {

        topicsContainer.textContent = "No major topics identified.";

    } else {

        insights.key_topics.forEach(topic => {

            const tag = document.createElement("span");

            tag.className = "tag";

            tag.textContent = topic;

            topicsContainer.appendChild(tag);

        });

    }


    // Compliance flags
    const complianceContainer =
        document.getElementById("compliance");

    complianceContainer.innerHTML = "";

    if (insights.compliance_flags.length === 0) {

        const li = document.createElement("li");

        li.textContent = "No compliance issues identified.";

        complianceContainer.appendChild(li);

    } else {

        insights.compliance_flags.forEach(flag => {

            const li = document.createElement("li");

            li.textContent = flag;

            complianceContainer.appendChild(li);

        });

    }


// Agent performance
document.getElementById("agentPerformance").textContent =
    insights.agent_performance_notes;


// Conversation
const conversationContainer =
    document.getElementById("conversation");

conversationContainer.innerHTML = "";

insights.conversation.forEach(turn => {

    const turnContainer =
        document.createElement("div");

    turnContainer.className =
        `conversation-turn ${turn.speaker}`;


    const speaker =
        document.createElement("div");

    speaker.className = "speaker";

    speaker.textContent =
        turn.speaker === "agent"
            ? "🤖 AGENT"
            : "👤 CUSTOMER";


    const message =
        document.createElement("div");

    message.className = "message";

    message.textContent = turn.text;


    turnContainer.appendChild(speaker);
    turnContainer.appendChild(message);

    conversationContainer.appendChild(turnContainer);

});


// Transcript
document.getElementById("transcript").textContent =
    data.english_transcript;


    // Show results
    results.classList.remove("hidden");


    // Scroll to results
    results.scrollIntoView({
        behavior: "smooth"
    });

}