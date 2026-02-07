document.getElementById("check").onclick = function(event) {
  event.preventDefault();
  document.getElementById("result").innerText = "Analyzing Laptop For Value...";
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const tab = tabs[0];
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: function() {
          let text = '';
          
          const title = document.querySelector('h1, [id*="title"], [class*="product-title"]');
          if (title) text += "Product: " + title.innerText + "\n\n";

          const specSections = document.querySelectorAll('[class*="spec"], [id*="spec"], [class*="feature"], [id*="feature"], [class*="detail"], [id*="detail"]');
          specSections.forEach(section => {
            text += section.innerText + "\n";
          });
          
          if (text.length < 100) {
            const description = document.querySelector('[class*="description"], [id*="description"], [class*="product-info"]');
            if (description) text += description.innerText;
          }
          
          if (text.length < 100) {
            text = document.body.innerText;
          }
          
          return text;
        }
      },
      function(results) {
        const pageText = results[0].result;
        analyzeLaptopSpecs(pageText);
      }
    );
  });
};

async function analyzeLaptopSpecs(text) {
  const apiKey = "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";
  const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

  const requestData = {
    model: "llama-3.3-70b-versatile",
    messages: [ 
      {
        role: "system",
        content: "You are an AI that evaluates laptop specs. Even if the text contains navigation menus or other irrelevant content, find the laptop specifications (processor/CPU, RAM, storage, screen size, graphics card) and evaluate them. Respond with one of: 'Good specs — buy it!', 'Mixed specs — consider carefully', 'Weak specs — do not buy'. Add a brief explanation focusing on the key specs you found."
      },
      {
        role: "user",
        content: `Find the laptop specs in this text and evaluate them: ${text.substring(0, 4000)}`
      }
    ],
    max_tokens: 200,
    temperature: 0.5
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();
    
    if (data.error) {
      document.getElementById("result").innerText = "Error: " + data.error.message;
      console.error("API Error:", data.error);
    } else {
      const verdict = data.choices[0].message.content.trim();
      document.getElementById("result").innerText = verdict;
    }
  } catch (error) {
    console.error(error);
    document.getElementById("result").innerText = "Can't connect to AI API";
  }
}