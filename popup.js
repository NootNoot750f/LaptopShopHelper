document.getElementById("check").onclick = function(event) {
  event.preventDefault();
  document.getElementById("result").innerText = "Analyzing Laptop For Value...";

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const tab = tabs[0];
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: function() {
          return document.body.innerText;
        }
      },
      function(results) {
        const pageText = results[0].result;
        analyzeLaptopSpecs(pageText);
      }
    );
  });
};

function analyzeLaptopSpecs(text) {
  const apiKey = "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";
  const apiUrl = "https://api.openai.com/v1/completions";

  const requestData = {
    model: "text-davinci-003",
    prompt: `You are an AI that evaluates laptop specs. Analyze the following text and return one of:
"Good specs — buy it!", 
"Mixed specs — consider carefully", 
"Weak specs — do not buy". 
Briefly explain why if specs are poor. Text: ${text}`,
    max_tokens: 50
  };

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey
    },
    body: JSON.stringify(requestData)
  })
    .then(response => response.json())
    .then(data => {
      const verdict = data.choices[0].text.trim();
      document.getElementById("result").innerText = verdict;
    })
    .catch(error => {
      console.error(error);
      document.getElementById("result").innerText = "Can't connect to AI API";
    });
}
