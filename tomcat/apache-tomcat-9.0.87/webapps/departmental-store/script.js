document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.form-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active classes
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked tab and corresponding section
            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // Validation Utility Functions
    const showError = (input, message) => {
        const inputGroup = input.parentElement;
        inputGroup.classList.remove('success');
        inputGroup.classList.add('error');
        const errorElement = inputGroup.querySelector('.error-msg');
        errorElement.textContent = message;
    };

    const showSuccess = (input) => {
        const inputGroup = input.parentElement;
        inputGroup.classList.remove('error');
        inputGroup.classList.add('success');
        const errorElement = inputGroup.querySelector('.error-msg');
        errorElement.textContent = '';
    };

    const checkRequired = (inputArray) => {
        let isValid = true;
        inputArray.forEach(input => {
            if (input.value.trim() === '') {
                showError(input, `${getFieldName(input)} is required`);
                isValid = false;
            } else {
                showSuccess(input);
            }
        });
        return isValid;
    };

    const checkLength = (input, min, max) => {
        if (input.value.length < min) {
            showError(input, `${getFieldName(input)} must be at least ${min} characters`);
            return false;
        } else if (input.value.length > max) {
            showError(input, `${getFieldName(input)} must be less than ${max} characters`);
            return false;
        } else {
            showSuccess(input);
            return true;
        }
    };

    const checkEmail = (input) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test(input.value.trim())) {
            showSuccess(input);
            return true;
        } else {
            showError(input, 'Email is not valid');
            return false;
        }
    };

    const checkPasswordsMatch = (input1, input2) => {
        if (input1.value !== input2.value) {
            showError(input2, 'Passwords do not match');
            return false;
        }
        return true;
    };

    const checkPhone = (input) => {
        const re = /^\d{10}$/;
        // Strip non-digits for validation
        const cleanNumber = input.value.replace(/\D/g, '');
        if (re.test(cleanNumber)) {
            showSuccess(input);
            return true;
        } else {
            showError(input, 'Phone must be 10 digits');
            return false;
        }
    };

    const checkCardNumber = (input) => {
        const re = /^\d{16}$/;
        const cleanNumber = input.value.replace(/\D/g, '');
        if (re.test(cleanNumber)) {
            showSuccess(input);
            return true;
        } else {
            showError(input, 'Card must be 16 digits');
            return false;
        }
    };

    const checkExpiry = (input) => {
        const re = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
        if (re.test(input.value)) {
            // Also check if not expired
            const [month, year] = input.value.split('/');
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = parseInt(now.getFullYear().toString().substr(-2));
            
            if (parseInt(year) > currentYear || (parseInt(year) === currentYear && parseInt(month) >= currentMonth)) {
                showSuccess(input);
                return true;
            } else {
                showError(input, 'Card has expired');
                return false;
            }
        } else {
            showError(input, 'Use MM/YY format');
            return false;
        }
    };

    const checkCVV = (input) => {
        const re = /^\d{3,4}$/;
        if (re.test(input.value)) {
            showSuccess(input);
            return true;
        } else {
            showError(input, 'CVV must be 3-4 digits');
            return false;
        }
    };

    const getFieldName = (input) => {
        const label = input.parentElement.querySelector('label');
        return label ? label.innerText : input.id;
    };

    // 1. Registration Form Validation
    const regForm = document.getElementById('registration');
    const fName = document.getElementById('reg-firstname');
    const lName = document.getElementById('reg-lastname');
    const regEmail = document.getElementById('reg-email');
    const regPassword = document.getElementById('reg-password');
    const regConfirm = document.getElementById('reg-confirm-password');
    const regPhone = document.getElementById('reg-phone');

    regForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = checkRequired([fName, lName, regEmail, regPassword, regConfirm, regPhone]);
        if (isValid) {
            isValid = checkEmail(regEmail) && isValid;
            isValid = checkLength(regPassword, 8, 25) && isValid;
            isValid = checkPasswordsMatch(regPassword, regConfirm) && isValid;
            isValid = checkPhone(regPhone) && isValid;
            
            if (isValid) {
                regForm.submit();
            }
        }
    });

    // Auto-format phone
    regPhone.addEventListener('input', function(e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });

    // 2. Login Form Validation
    const loginForm = document.getElementById('login');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = checkRequired([loginEmail, loginPassword]);
        if (isValid) {
            isValid = checkEmail(loginEmail) && isValid;
            if (isValid) {
                loginForm.submit();
            }
        }
    });

    // 3. Profile Form Validation
    const profileForm = document.getElementById('profile');
    const profName = document.getElementById('prof-fullname');
    const profEmail = document.getElementById('prof-email');
    const profAddress = document.getElementById('prof-address');
    const profDob = document.getElementById('prof-dob');

    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = checkRequired([profName, profEmail, profAddress, profDob]);
        if (isValid) {
            isValid = checkEmail(profEmail) && isValid;
            if (isValid) {
                profileForm.submit();
            }
        }
    });

    // 4. Payment Form Validation
    const paymentForm = document.getElementById('payment');
    const payName = document.getElementById('pay-name');
    const payCard = document.getElementById('pay-card');
    const payExpiry = document.getElementById('pay-expiry');
    const payCvv = document.getElementById('pay-cvv');

    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = checkRequired([payName, payCard, payExpiry, payCvv]);
        if (isValid) {
            isValid = checkCardNumber(payCard) && isValid;
            isValid = checkExpiry(payExpiry) && isValid;
            isValid = checkCVV(payCvv) && isValid;
            if (isValid) {
                paymentForm.submit();
            }
        }
    });

    // Auto-format card number
    payCard.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim();
    });

    // Auto-format expiry date
    payExpiry.addEventListener('input', function(e) {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
        } else {
            e.target.value = val;
        }
    });
});
