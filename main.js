/* =============================================
   WASHCATION LAUNDRY — Landing Page Script
   ============================================= */

(function () {
  'use strict';

  // ---- Lead form validation & submission ----
  const form           = document.getElementById('leadForm');
  const success        = document.getElementById('formSuccess');
  const nameInput      = document.getElementById('fullName');
  const igInput        = document.getElementById('instagram');
  const privacyCheck   = document.getElementById('privacyConsent');
  const nameError      = document.getElementById('nameError');
  const igError        = document.getElementById('igError');
  const privacyError   = document.getElementById('privacyError');

  if (!form) return;

  // ---- Privacy policy toggle ----
  const privacyToggle = document.getElementById('privacyToggle');
  const privacyPolicy = document.getElementById('privacyPolicy');

  if (privacyToggle && privacyPolicy) {
    privacyToggle.addEventListener('click', function () {
      const isHidden = privacyPolicy.hidden;
      privacyPolicy.hidden = !isHidden;
      privacyToggle.setAttribute('aria-expanded', String(isHidden));
    });
  }

  // ---- Validation ----
  function clearErrors() {
    nameError.textContent    = '';
    igError.textContent      = '';
    privacyError.textContent = '';
    nameInput.classList.remove('is-error');
    igInput.classList.remove('is-error');
  }

  function validate() {
    let valid = true;
    clearErrors();

    const nameVal = nameInput.value.trim();
    const igVal   = igInput.value.trim().replace(/^@/, '');

    if (!nameVal) {
      nameError.textContent = 'Please enter your name.';
      nameInput.classList.add('is-error');
      nameInput.focus();
      valid = false;
    }

    if (!igVal) {
      igError.textContent = 'Please enter your Instagram username.';
      igInput.classList.add('is-error');
      if (valid) igInput.focus();
      valid = false;
    } else if (!/^[a-zA-Z0-9._]{1,30}$/.test(igVal)) {
      igError.textContent = 'Enter a valid Instagram username (letters, numbers, . or _).';
      igInput.classList.add('is-error');
      if (valid) igInput.focus();
      valid = false;
    }

    if (!privacyCheck.checked) {
      privacyError.textContent = 'Please agree to the Privacy Policy to continue.';
      if (valid) privacyCheck.focus();
      valid = false;
    }

    return valid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    // Gather data — key names match the Google Apps Script expectation
    const data = {
      nama:      nameInput.value.trim(),
      instagram: igInput.value.trim().replace(/^@/, ''),
      scent:     (form.querySelector('input[name="scent"]:checked') || {}).value || 'not selected',
      privacy:   true,
      timestamp: new Date().toISOString(),
    };

    // Disable button & show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    // Send to Google Sheets via Apps Script
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRY1jYdQDsMHf8Td5jCe1kIqLUKHhWmFFEpUeazXBkWp5gq1RI7b3us5j_xh_bueeU/exec';

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode:   'no-cors',          // Apps Script requires no-cors
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function () {
        // no-cors returns opaque response — treat completion as success
        form.hidden    = true;
        success.hidden = false;
        success.setAttribute('aria-live', 'polite');
      })
      .catch(function (err) {
        console.error('Submission error:', err);
        submitBtn.disabled    = false;
        submitBtn.textContent = originalLabel;
        // Show inline error below button
        var existingErr = form.querySelector('.submit-error');
        if (!existingErr) {
          var errEl = document.createElement('p');
          errEl.className  = 'submit-error field__error';
          errEl.style.marginTop = '.5rem';
          errEl.textContent = 'Something went wrong. Please try again.';
          submitBtn.insertAdjacentElement('afterend', errEl);
        }
      });
  });

  // Strip leading @ as user types in IG field
  igInput.addEventListener('input', function () {
    if (this.value.startsWith('@')) {
      this.value = this.value.slice(1);
    }
  });

  // Clear privacy error once user checks the box
  privacyCheck.addEventListener('change', function () {
    if (this.checked) privacyError.textContent = '';
  });

  // ---- Light Traveler item toggle ----
  const itemToggle = document.getElementById('lightTravelerToggle');
  const itemList   = document.getElementById('lightTravelerItems');

  if (itemToggle && itemList) {
    itemToggle.addEventListener('click', function () {
      const isHidden = itemList.hidden;
      itemList.hidden = !isHidden;
      itemToggle.setAttribute('aria-expanded', String(isHidden));
    });
  }

  // ---- Smooth scroll for anchor CTA ----
  document.querySelectorAll('a[href="#top"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Focus the name field after scroll for accessibility
      setTimeout(function () { nameInput && nameInput.focus(); }, 600);
    });
  });

  // ---- Intersection observer: fade-in sections ----
  const sections = document.querySelectorAll('.section, .hero__form-wrap, .hero__copy');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach(function (el) {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }

})();
