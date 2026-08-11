const audioFile = document.getElementById("audioFile");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const status = document.getElementById("status");

// ----------------------------------------
// Show selected filename
// ----------------------------------------

audioFile.addEventListener("change", () => {

    if (audioFile.files.length === 0) {
        fileName.textContent = "";
        return;
    }

    fileName.textContent =
        `Selected: ${audioFile.files[0].name}`;
});


// ----------------------------------------
// Analyze button
// ----------------------------------------

analyzeBtn.addEventListener("click", async () => {

    if (audioFile.files.length === 0) {

        status.textContent =
            "Please select an audio file first.";

        return;
    }

    const file = audioFile.files[0];

    const formData = new FormData();

    formData.append("file", file);


    // ----------------------------------------
    // Loading state
    // ----------------------------------------

    analyzeBtn.disabled = true;

    analyzeBtn.textContent =
        "Analyzing...";

    status.textContent =
        "Uploading and analyzing your call.";


    try {

        console.log("Sending audio to /api/analyze...");


        const response =
            await fetch(
                "/api/analyze",
                {
                    method: "POST",
                    body: formData
                }
            );


        console.log(
            "API response status:",
            response.status
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Server error (${response.status}): ${errorText}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Analysis response:",
            data
        );


        // ----------------------------------------
        // Store selected call
        // ----------------------------------------

        localStorage.setItem(
            "selectedCall",
            JSON.stringify(data)
        );


        // ----------------------------------------
        // Redirect to call details
        // ----------------------------------------

        status.textContent =
            "Analysis complete. Opening results...";


        window.location.href =
            "/frontend/call.html";

    }


    catch (error) {

        console.error(
            "Analysis error:",
            error
        );


        status.textContent =
            "Something went wrong. Check the browser console.";

        alert(
            error.message
        );

    }


    finally {

        analyzeBtn.disabled =
            false;

        analyzeBtn.textContent =
            "Analyze Call";

    }

});

