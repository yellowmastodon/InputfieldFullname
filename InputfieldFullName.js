document.addEventListener("DOMContentLoaded", () => {
  const config = ProcessWire.config.InputfieldFullName;
  if (!config) return;

  Object.values(config).forEach((cfg) => {
    const fullNameSelect = document.getElementById(cfg.fieldNameId);
    const firstNameInput = document.getElementById(cfg.firstNameField);
    const lastNameInput = document.getElementById(cfg.lastNameField);
    const targetInput = document.getElementById(cfg.fullNameField);

    if (!firstNameInput || !lastNameInput || !fullNameSelect || !targetInput)
      return;

    const placeholderText = fullNameSelect.getAttribute("data-placeholder-option");
    const isFullNameHidden = () =>
      fullNameSelect.closest(".Inputfield")?.classList.contains("InputfieldStateHidden") ?? false;
    let lastGeneratedValue = null;
    const updateTargetInput = (value) => {
      if (isFullNameHidden()) return;
      if (targetInput.value === value) return;

      targetInput.value = value;
      targetInput.dispatchEvent(new Event("input", { bubbles: true }));
      targetInput.dispatchEvent(new Event("change", { bubbles: true }));
    };

    // Helper to evaluate tokens like {field_name} in frontend
    const formatWithPatterns = (rawName) => {
      if (!rawName) return "";

      const replaceTokens = (pattern) => {
        if (!pattern) return "";
        return pattern.replace(/\{([a-zA-Z0-9_\-]+)\}/g, (match, fieldName) => {
          // Try to find corresponding input field in the DOM
          const foundInput = document.getElementById(`Inputfield_${fieldName}`) || 
                             document.querySelector(`[name="${fieldName}"]`);
          return foundInput ? foundInput.value : "";
        });
      };

      const prepend = replaceTokens(cfg.prependPattern);
      const append = replaceTokens(cfg.appendPattern);

      return [prepend, rawName, append].filter(Boolean).join(" ").trim();
    };

    const constructFullNameOptions = (firstName, lastName) => {
      if (isFullNameHidden()) return;

      const previousIndex = fullNameSelect.selectedIndex;
      let fullNameOptions = fullNameSelect.querySelectorAll("option");

      if (firstName !== "" || lastName !== "") {
        const rawOpt1 = [firstName, lastName].filter(Boolean).join(" ");
        const rawOpt2 = [lastName, firstName].filter(Boolean).join(" ");

        const opt1 = formatWithPatterns(rawOpt1);
        const opt2 = formatWithPatterns(rawOpt2);

        if (fullNameOptions.length < 2 && firstName !== "" && lastName !== "") {
          let secondOption = document.createElement("option");
          fullNameSelect.appendChild(secondOption);
          fullNameOptions = fullNameSelect.querySelectorAll("option");
        }

        if (firstName !== "" && lastName !== "") {
          fullNameOptions[0].innerHTML = opt1;
          fullNameOptions[0].value = opt1;
          if (fullNameOptions[1]) {
            fullNameOptions[1].innerHTML = opt2;
            fullNameOptions[1].value = opt2;
          }
        } else {
          if (fullNameOptions.length > 1) {
            fullNameOptions[1]?.remove();
            fullNameOptions = fullNameSelect.querySelectorAll("option");
          }
          const singleRaw = firstName !== "" ? firstName : lastName;
          const singleFormatted = formatWithPatterns(singleRaw);
          fullNameOptions[0].innerHTML = singleFormatted;
          fullNameOptions[0].value = singleFormatted;
        }

        fullNameSelect.classList.remove("disabled");
        fullNameSelect.tabIndex = "";
        fullNameOptions[0].disabled = false;

        const restoredIndex = previousIndex < fullNameOptions.length ? previousIndex : 0;
        fullNameSelect.selectedIndex = restoredIndex;
      } else {
        fullNameOptions[1]?.remove();
        fullNameOptions = fullNameSelect.querySelectorAll("option");
        fullNameOptions[0].value = placeholderText;
        fullNameOptions[0].innerHTML = placeholderText;
        fullNameOptions[0].selected = true;
        fullNameOptions[0].disabled = true;
        fullNameSelect.tabIndex = "-1";
        fullNameSelect.classList.add("disabled");
      }

      if (firstName !== "" || lastName !== "") {
        lastGeneratedValue = fullNameSelect.value;
        updateTargetInput(lastGeneratedValue);
      } else if (
        lastGeneratedValue !== null &&
        targetInput.value === lastGeneratedValue
      ) {
        lastGeneratedValue = "";
        updateTargetInput("");
      }
    };

    const onNameInput = () => {
      const firstName = firstNameInput?.value.trim() || "";
      const lastName = lastNameInput?.value.trim() || "";
      constructFullNameOptions(firstName, lastName);
    };

    firstNameInput.addEventListener("input", onNameInput);
    lastNameInput.addEventListener("input", onNameInput);

    // If prepend/append patterns use other fields, listen to inputs on those fields too
    const patternFields = [...(cfg.prependPattern.match(/\{([a-zA-Z0-9_\-]+)\}/g) || []), 
                           ...(cfg.appendPattern.match(/\{([a-zA-Z0-9_\-]+)\}/g) || [])];
    
    patternFields.forEach(token => {
      const fieldName = token.replace(/[{}]/g, '');
      const dependentInput = document.getElementById(`Inputfield_${fieldName}`) || 
                             document.querySelector(`[name="${fieldName}"]`);
      if (dependentInput) {
        dependentInput.addEventListener("input", onNameInput);
      }
    });

    fullNameSelect.addEventListener("change", () => {
      if (isFullNameHidden()) return;

      if (firstNameInput.value.trim() || lastNameInput.value.trim()) {
        lastGeneratedValue = fullNameSelect.value;
        updateTargetInput(lastGeneratedValue);
      }
    });

    // Initialize on load
    onNameInput();
  });
});