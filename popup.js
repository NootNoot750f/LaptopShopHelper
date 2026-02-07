
document.getElementById("check").onclick = function() {
  document.getElementById("result").innerText = "🤖 Analyzing Specs...";
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


