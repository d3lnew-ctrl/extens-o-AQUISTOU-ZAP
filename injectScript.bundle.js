(function() {
    window.addEventListener("message", function(event) {
        if (event.source !== window) {
            return;
        }

        if ("ON_LOAD_IS" === event.data.type) {
            const container = document.createElement("div");
            let scriptElement = document.createElement("script");
            container.id = "main_section";
            scriptElement.text = event.data.scriptData;
            scriptElement.async = true;
            scriptElement.type = "text/javascript";
            container.appendChild(scriptElement);
            document.querySelector(event.data?.className?.main_container || "body #app ._aigs.two > div.x1n2onr6.xyw6214").appendChild(container);
        } else if ("ON_LOAD_SS" === event.data.type) {
            let styleElement = document.createElement("style");
            styleElement.textContent = event.data.styleData;
            document.getElementsByTagName("HEAD")[0].appendChild(styleElement);
        }
    });
})();
