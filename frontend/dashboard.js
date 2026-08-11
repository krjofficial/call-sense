let calls = [];


// ========================================
// LOAD DATA
// ========================================

async function loadCalls() {

    try {

        const response =
            await fetch("/api/calls");


        if (!response.ok) {

            throw new Error(
                "Failed to fetch calls"
            );

        }


        calls =
            await response.json();


        renderDashboard();

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "dashboardStatus"
        ).textContent =
            "Unable to load call data.";

    }

}


// ========================================
// DASHBOARD
// ========================================

function renderDashboard() {

    renderKPIs();

    renderSentimentChart();

    renderRiskChart();

    renderTopics();

    renderCompliance();

    renderCallsTable();

}


// ========================================
// KPI CARDS
// ========================================

function renderKPIs() {

    const total =
        calls.length;


    document.getElementById(
        "totalCalls"
    ).textContent =
        total;


    if (total === 0) {

        document.getElementById(
            "averageSentiment"
        ).textContent =
            "0.00";


        document.getElementById(
            "escalationRate"
        ).textContent =
            "0%";


        document.getElementById(
            "complianceRate"
        ).textContent =
            "0%";

        return;

    }


    // Average sentiment

    const sentimentTotal =
        calls.reduce(
            (sum, call) =>
                sum +
                Number(
                    call.insights.sentiment_score
                ),
            0
        );


    const average =
        sentimentTotal / total;


    document.getElementById(
        "averageSentiment"
    ).textContent =
        average.toFixed(2);


    // Escalation rate

    const escalationCount =
        calls.filter(
            call =>
                call.insights.escalation_risk
        ).length;


    const escalationRate =
        (escalationCount / total) * 100;


    document.getElementById(
        "escalationRate"
    ).textContent =
        `${escalationRate.toFixed(0)}%`;


    // Compliance rate

    const complianceCount =
        calls.filter(
            call =>
                call.insights.compliance_flags &&
                call.insights.compliance_flags.length > 0
        ).length;


    const complianceRate =
        (complianceCount / total) * 100;


    document.getElementById(
        "complianceRate"
    ).textContent =
        `${complianceRate.toFixed(0)}%`;

}


// ========================================
// SENTIMENT CHART
// ========================================

function renderSentimentChart() {

    const sentiments = [
        "positive",
        "neutral",
        "negative",
        "mixed"
    ];


    const counts = {};


    sentiments.forEach(
        sentiment => {

            counts[sentiment] =
                calls.filter(
                    call =>
                        call.insights.sentiment === sentiment
                ).length;

        }
    );


    const max =
        Math.max(
            ...Object.values(counts),
            1
        );


    const container =
        document.getElementById(
            "sentimentChart"
        );


    container.innerHTML = "";


    sentiments.forEach(
        sentiment => {

            const count =
                counts[sentiment];


            const percentage =
                calls.length
                    ? (count / calls.length) * 100
                    : 0;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "chart-row";


            row.innerHTML = `

                <div class="chart-label">
                    ${capitalize(sentiment)}
                </div>


                <div class="chart-track">

                    <div
                        class="chart-bar"
                        style="
                            width: ${
                                (count / max) * 100
                            }%;
                        "
                    ></div>

                </div>


                <div class="chart-value">

                    ${count}

                    <small>
                        (${percentage.toFixed(0)}%)
                    </small>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// ========================================
// ESCALATION
// ========================================

function renderRiskChart() {

    const high =
        calls.filter(
            call =>
                call.insights.escalation_risk
        ).length;


    const low =
        calls.length - high;


    const max =
        Math.max(
            high,
            low,
            1
        );


    const container =
        document.getElementById(
            "riskChart"
        );


    container.innerHTML = "";


    const data = [
        ["High Risk", high],
        ["Low Risk", low]
    ];


    data.forEach(
        ([label, value]) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "chart-row";


            row.innerHTML = `

                <div class="chart-label">
                    ${label}
                </div>


                <div class="chart-track">

                    <div
                        class="chart-bar"
                        style="
                            width: ${
                                (value / max) * 100
                            }%;
                        "
                    ></div>

                </div>


                <div class="chart-value">
                    ${value}
                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// ========================================
// TOPICS
// ========================================

function renderTopics() {

    const topicCounts = {};


    calls.forEach(
        call => {

            if (
                !call.insights.key_topics
            ) {
                return;
            }


            call.insights.key_topics
                .forEach(
                    topic => {

                        topicCounts[topic] =
                            (
                                topicCounts[topic]
                                || 0
                            ) + 1;

                    }
                );

        }
    );


    const sorted =
        Object.entries(topicCounts)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 8);


    const container =
        document.getElementById(
            "topicsChart"
        );


    container.innerHTML = "";


    if (
        sorted.length === 0
    ) {

        container.textContent =
            "No topic data available.";

        return;

    }


    sorted.forEach(
        ([topic, count]) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "topic-row";


            row.innerHTML = `

                <span>
                    ${topic}
                </span>


                <strong>
                    ${count}
                    ${
                        count === 1
                            ? " call"
                            : " calls"
                    }
                </strong>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// ========================================
// COMPLIANCE
// ========================================

function renderCompliance() {

    const flags = {};


    calls.forEach(
        call => {

            if (
                !call.insights.compliance_flags
            ) {
                return;
            }


            call.insights.compliance_flags
                .forEach(
                    flag => {

                        flags[flag] =
                            (
                                flags[flag]
                                || 0
                            ) + 1;

                    }
                );

        }
    );


    const sorted =
        Object.entries(flags)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    const container =
        document.getElementById(
            "complianceList"
        );


    container.innerHTML = "";


    if (
        sorted.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                ✓ No compliance issues detected
            </div>
        `;

        return;

    }


    sorted.forEach(
        ([flag, count]) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "topic-row";


            row.innerHTML = `

                <span>
                    ⚠️ ${flag}
                </span>


                <strong>
                    ${count}
                </strong>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// ========================================
// CALL TABLE
// ========================================

function renderCallsTable() {

    const container =
        document.getElementById(
            "callsTable"
        );


    container.innerHTML = "";


    if (
        calls.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                No calls analyzed yet.
            </div>
        `;

        return;

    }


    const table =
        document.createElement(
            "table"
        );


    table.innerHTML = `

        <thead>

            <tr>

                <th>Call</th>

                <th>Language</th>

                <th>Sentiment</th>

                <th>Score</th>

                <th>Risk</th>

                <th>Topics</th>

            </tr>

        </thead>


        <tbody></tbody>

    `;


    const tbody =
        table.querySelector(
            "tbody"
        );


    calls.forEach(
        call => {

            const insights =
                call.insights;


            const row =
                document.createElement(
                    "tr"
                );


            row.className =
                "clickable-row";


            row.innerHTML = `

                <td>
                    <strong>
                        ${call.filename}
                    </strong>
                </td>


                <td>
                    ${call.original_language}
                </td>


                <td>
                    <span class="sentiment-badge">

                        ${capitalize(
                            insights.sentiment
                        )}

                    </span>
                </td>


                <td>
                    ${Number(
                        insights.sentiment_score
                    ).toFixed(2)}
                </td>


                <td>

                    ${
                        insights.escalation_risk
                            ? '<span class="risk-high">🔴 High</span>'
                            : '<span class="risk-low">🟢 Low</span>'
                    }

                </td>


                <td>
                    ${
                        insights.key_topics
                            .slice(0, 2)
                            .join(", ")
                    }
                </td>

            `;


            row.addEventListener(
                "click",
                () => {

                    localStorage.setItem(
                        "selectedCall",
                        JSON.stringify(
                            call
                        )
                    );


                    window.location.href =
                        "/frontend/call.html";

                }
            );


            tbody.appendChild(
                row
            );

        }
    );


    container.appendChild(
        table
    );

}


// ========================================
// ANALYZE ALL
// ========================================

document.getElementById(
    "analyzeAllBtn"
).addEventListener(
    "click",
    async () => {

        const button =
            document.getElementById(
                "analyzeAllBtn"
            );


        const status =
            document.getElementById(
                "dashboardStatus"
            );


        button.disabled = true;


        button.textContent =
            "Analyzing...";


        status.textContent =
            "Analyzing new recordings. Please wait...";


        try {

            const response =
                await fetch(
                    "/api/analyze-all",
                    {
                        method: "POST"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Analysis failed"
                );

            }


            const data =
                await response.json();


            const analyzed =
                data.results
                    ? data.results.length
                    : 0;


            if (analyzed === 0) {

                status.textContent =
                    "No new recordings to analyze.";

            } else {

                status.textContent =
                    `${analyzed} new call${
                        analyzed === 1
                            ? ""
                            : "s"
                    } analyzed successfully.`;

            }


            await loadCalls();

        }


        catch (error) {

            console.error(error);


            status.textContent =
                "Something went wrong while analyzing calls.";

        }


        finally {

            button.disabled =
                false;


            button.textContent =
                "Analyze All Calls";

        }

    }
);


// ========================================
// HELPER
// ========================================

function capitalize(text) {

    return text
        .charAt(0)
        .toUpperCase()
        + text.slice(1);

}


// ========================================
// START
// ========================================

loadCalls();