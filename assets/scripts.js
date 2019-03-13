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

function scrollToElement ($element) {
  window.scrollTo({top: $element.offsetTop, behavior: 'smooth'});
}

function showLoader (scrollTo) {
  window.app.loader.classList.toggle('visible');
  window.app.loader.classList.toggle('active');

  if (scrollTo === true) {
    scrollToElement(window.app.loader);
  }
}

function hideLoader () {
  window.app.loader.classList.toggle('active');
  window.setTimeout(function () {
    window.app.loader.classList.toggle('visible');
  }, 200);
}

function formatNumber (number) {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
    .format(number);
}

function calculateEpicProfits () {
  var totalSales = (window.app.price * window.app.expectedSales.epic).toFixed(2);

  var share = window.app.price / 100 * window.app.shares.epic;
  var finalPrice = (window.app.price - share).toFixed(2);

  var epicShare = (window.app.price - finalPrice).toFixed(2);
  var epicProfit = (window.app.expectedSales.epic * epicShare).toFixed(2);

  var profit = window.app.expectedSales.epic * finalPrice;
  profit += window.app.funding;
  profit = profit.toFixed(2);

  var $epicResults = document.querySelector('.epic-results');

  $epicResults.querySelector('.epic-sales-total').innerHTML = formatNumber(totalSales);
  $epicResults.querySelector('.epic-single-profit').innerHTML = formatNumber(finalPrice);
  $epicResults.querySelector('.epic-epic-share').innerHTML = formatNumber(epicShare);
  $epicResults.querySelector('.epic-epic-profit').innerHTML = formatNumber(epicProfit);
  $epicResults.querySelector('.epic-final-profit').innerHTML = formatNumber(profit);

  $epicResults.style.display = 'block';

  scrollToElement($epicResults);
}

window.onload = function () {
  console.log('Epic Shit Calculator v0.1 initialized');

  document.querySelector('.form').reset();
  window.app.loader = document.querySelector('.loader');

  var $numericInputs = document.querySelectorAll('[type=number]');
  var $platformSelects = document.querySelectorAll('.platform-select');
  var $calcButton = document.querySelector('.calculate');

  // Generic handler for numeric input fields
  $numericInputs.forEach(function ($input) {
    $input.addEventListener('keyup', function (event) {
      var value = $input.value;
      var option = $input.dataset.option;

      // Check if the input is valid
      if (!$input.checkValidity()) {
        // Reset the
        value = 0;
      } else {
        // Try to parse the value as a number
        value = parseInt(value);
      }

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

    $salesInput.disabled = true;

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
    // Reset all error messages
    document.querySelectorAll('.form-errors p').forEach(function ($message) {
      $message.style.display = 'none';
    });

    var totalSales = 0;
    for (var key in window.app.expectedSales) {
      if (window.app.expectedSales.hasOwnProperty(key)) {
        totalSales += window.app.expectedSales[key];
      }
    }

    if (window.app.expectedSales.epic === 0) {
      document.querySelector('.error-no-sales').style.display = 'block';
      return;
    }

    if (window.app.price === 0) {
      document.querySelector('.error-no-price').style.display = 'block';
      return;
    }

    if (totalSales <= window.app.expectedSales.epic) {
      document.querySelector('.error-no-platform').style.display = 'block';
      return;
    }

    // All set, let's calculate!
    // First, activate the loader
    showLoader(true);

    window.setTimeout(function () {
      hideLoader();

      // Calculate the total profit expected from the epic store
      calculateEpicProfits();

      // Calculate the profits for each selected platform

      // Calculate the difference between the profits

      // Show all results to the user

    }, 2000);

  });
};
