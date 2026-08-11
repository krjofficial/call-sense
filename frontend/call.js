const selectedCall =
    JSON.parse(
        localStorage.getItem("selectedCall")
    );


if (!selectedCall) {

    window.location.href =
        "/frontend/dashboard.html";

}


// -------------------------
// Basic information
// -------------------------

document.getElementById(
    "filename"
).textContent =
    selectedCall.filename;


const insights =
    selectedCall.insights;


// -------------------------
// Overview
// -------------------------

document.getElementById(
    "sentiment"
).textContent =
    capitalize(
        insights.sentiment
    );


document.getElementById(
    "sentimentScore"
).textContent =
    Number(
        insights.sentiment_score
    ).toFixed(2);


document.getElementById(
    "language"
).textContent =
    selectedCall.original_language;


document.getElementById(
    "escalation"
).textContent =
    insights.escalation_risk
        ? "High Risk"
        : "Low Risk";


// -------------------------
// Summary
// -------------------------

document.getElementById(
    "summary"
).textContent =
    insights.summary;


// -------------------------
// Topics
// -------------------------

const topicsContainer =
    document.getElementById(
        "topics"
    );


insights.key_topics.forEach(
    topic => {

        const tag =
            document.createElement(
                "span"
            );

        tag.className =
            "tag";

        tag.textContent =
            topic;

        topicsContainer.appendChild(
            tag
        );

    }
);


// -------------------------
// Compliance
// -------------------------

const complianceContainer =
    document.getElementById(
        "compliance"
    );


if (
    insights.compliance_flags.length === 0
) {

    const li =
        document.createElement(
            "li"
        );

    li.textContent =
        "No compliance issues identified.";

    complianceContainer.appendChild(
        li
    );

} else {

    insights.compliance_flags.forEach(
        flag => {

            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                flag;

            complianceContainer.appendChild(
                li
            );

        }
    );

}


// -------------------------
// Agent performance
// -------------------------

document.getElementById(
    "agentPerformance"
).textContent =
    insights.agent_performance_notes;


// -------------------------
// Conversation
// -------------------------

const conversationContainer =
    document.getElementById(
        "conversation"
    );


insights.conversation.forEach(
    turn => {

        const turnContainer =
            document.createElement(
                "div"
            );

        turnContainer.className =
            `conversation-turn ${turn.speaker}`;


        const speaker =
            document.createElement(
                "div"
            );

        speaker.className =
            "speaker";


        speaker.textContent =
            turn.speaker === "agent"
                ? "🤖 AGENT"
                : "👤 CUSTOMER";


        const message =
            document.createElement(
                "div"
            );

        message.className =
            "message";

        message.textContent =
            turn.text;


        turnContainer.appendChild(
            speaker
        );

        turnContainer.appendChild(
            message
        );

        conversationContainer.appendChild(
            turnContainer
        );

    }
);


// -------------------------
// Transcript
// -------------------------

document.getElementById(
    "transcript"
).textContent =
    selectedCall.english_transcript;


// -------------------------
// Helper
// -------------------------

function capitalize(text) {

    return text
        .charAt(0)
        .toUpperCase()
        + text.slice(1);

}