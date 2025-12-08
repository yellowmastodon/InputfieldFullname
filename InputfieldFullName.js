document.addEventListener("DOMContentLoaded", () => {
    const config = ProcessWire.config.InputfieldFullName;
    Object.values(config).forEach(cfg => {
        const fullNameSelect = document.getElementById(cfg.fieldNameId);
        const firstNameInput = document.getElementById(cfg.firstNameField);
        const lastNameInput = document.getElementById(cfg.lastNameField);
        const targetInput = document.getElementById(cfg.fullNameField);
        const placeholderText = fullNameSelect.getAttribute('data-placeholder-option');
        let fullNameOptions = fullNameSelect.querySelectorAll("option");

        const constructFullNameOptions = (firstName, lastName) => {
            fullNameOptions = fullNameSelect.querySelectorAll("option");

            if (firstName !== '' || lastName !== '') {
                if (fullNameOptions.length < 2 && firstName !== '' && lastName !== '') {
                    let secondOption = document.createElement("option");
                    secondOption.innerHTML = `${firstName} ${lastName}`;
                    secondOption.value = `${firstName} ${lastName}`;
                    fullNameSelect.appendChild(secondOption);
                    fullNameOptions = fullNameSelect.querySelectorAll("option");
                }

                if (firstName !== '' && lastName !== '') {
                    fullNameOptions[0].innerHTML = `${firstName} ${lastName}`;
                    fullNameOptions[0].value = `${firstName} ${lastName}`;
                    if (fullNameOptions[1]) {
                        fullNameOptions[1].innerHTML = `${lastName} ${firstName}`;
                        fullNameOptions[1].value = `${lastName} ${firstName}`;
                    }
                } else if (firstName !== '') {
                    if (fullNameOptions.length > 1) {
                        fullNameOptions[1]?.remove();
                        fullNameOptions = fullNameSelect.querySelectorAll("option");
                    }
                    fullNameOptions[0].innerHTML = firstName;
                    fullNameOptions[0].value = firstName;
                } else if (lastName !== '') {
                    if (fullNameOptions.length > 1) {
                        fullNameOptions[1]?.remove();
                        fullNameOptions = fullNameSelect.querySelectorAll("option");
                    }
                    fullNameOptions[0].innerHTML = lastName;
                    fullNameOptions[0].value = lastName;
                }

                fullNameSelect.classList.remove('disabled');
                fullNameSelect.tabIndex = "";
                fullNameOptions[0].disabled = false;
                fullNameOptions[0].selected = true;

            } else {
                fullNameOptions[1]?.remove();
                fullNameOptions = fullNameSelect.querySelectorAll("option");
                fullNameOptions[0].value = placeholderText;
                fullNameOptions[0].innerHTML = placeholderText;
                fullNameOptions[0].selected = true;
                fullNameOptions[0].disabled = true;
                fullNameSelect.tabIndex = "-1";
                fullNameSelect.classList.add('disabled');
            }

            targetInput.value = fullNameSelect.value; // keep target updated
        };

        const onNameInput = () => {
            const firstName = firstNameInput?.value.trim() || '';
            const lastName = lastNameInput?.value.trim() || '';
            constructFullNameOptions(firstName, lastName);
        };

        if (!firstNameInput || !lastNameInput || !fullNameSelect || !targetInput) return;

        firstNameInput.addEventListener("input", onNameInput);
        lastNameInput.addEventListener("input", onNameInput);

        fullNameSelect.addEventListener('change', () => {
            targetInput.value = fullNameSelect.value;
        });

        // initialize on load
        onNameInput();
    });
});

