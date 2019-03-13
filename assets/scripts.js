'use strict';

window.app = {
  expectedSales: {
    epic: 0,
    steam: 0,
    gog: 0,
    gmg: 0,
    itch: 0
  },
  shares: {
    epic: 12,
    steam: 30,
    gog: 30,
    gmg: 30,
    itch: 30
  },
  price: 0,
  funding: 0
};

window.onload = function () {
  console.log('Epic Shit Calculator v0.1 initialized');
  
  document.querySelector('.form').reset();

  var $numericInputs = document.querySelectorAll('[type=number]');
  var $platformSelects = document.querySelectorAll('.platform-select');
  var $calcButton = document.querySelector('.calculate');

  // Generic handler for numeric input fields
  $numericInputs.forEach(function ($input) {
    $input.addEventListener('keyup', function (event) {
      var value = parseInt($input.value);
      var option = $input.dataset.option;
      var errorMessage = $input.closest('div').querySelector('.error-message');

      if (value !== value) {
        errorMessage.style.display = 'block';
        return;
      }

      errorMessage.style.display = 'none';

      switch (option) {
        case 'epic-sales':
          window.app.expectedSales.epic = value;
          break;
        case 'price':
          window.app.price = value;
          break;
        case 'funding':
          window.app.funding = value;
          break;
      }
    });
  });

  // Handle platform selects
  $platformSelects.forEach(function ($select) {
    var platform = $select.dataset.platform;
    var $checkbox = $select.querySelector('.checkbox');
    var $salesInput = $select.querySelector('.form-input');

    // Listen to checkbox clicks
    $checkbox.addEventListener('change', function () {
      var isDisabled = !$checkbox.checked;
      $salesInput.disabled = isDisabled;

      if (isDisabled) {
        window.app.expectedSales[platform] = 0;
      } else {
        window.app.expectedSales[platform] = parseInt($salesInput.value);
      }
    });

    // Save expected sales on input change
    $salesInput.addEventListener('keyup', function () {
      window.app.expectedSales[platform] = parseInt($salesInput.value);
    });
  });

  $calcButton.addEventListener('click', function (e) {
    e.preventDefault();
    console.log(window.app); //@DEBUG
  });
};
