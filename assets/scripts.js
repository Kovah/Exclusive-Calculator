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
  funding: 0,
  platformProfits: 0,
  platforms: {
    epic: 'Epic Store',
    steam: 'Steam',
    gog: 'GOG.com',
    gmg: 'GreenManGaming',
    itch: 'Itch.io'
  }
};

/**
 * Shorthand for the window.scrollTo function
 * @param $element
 */
function scrollToElement ($element) {
  window.scrollTo({top: $element.offsetTop, behavior: 'smooth'});
}

/**
 * Show the loader element
 * @param scrollTo Tell the app to scroll to the loader
 */
function showLoader (scrollTo) {
  window.app.loader.classList.toggle('visible');
  window.app.loader.classList.toggle('active');

  if (scrollTo === true) {
    scrollToElement(window.app.loader);
  }
}

/**
 * Hode the loader element
 */
function hideLoader () {
  window.app.loader.classList.toggle('active');
  window.setTimeout(function () {
    window.app.loader.classList.toggle('visible');
  }, 200);
}

/**
 * Format a number to make it easier to read
 * @param number
 * @returns {*}
 */
function formatNumber (number) {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
    .format(number);
}

/**
 * Calculate the sales for a platform
 * @param platform
 * @param includeFunding
 * @returns {{finalPrice: string, totalSales: string, platformProfit: string, profit: string, platformShare: string}}
 */
function calculateSales (platform, includeFunding = false) {
  var totalSales = (window.app.price * window.app.expectedSales[platform]).toFixed(2);

  var share = window.app.price / 100 * window.app.shares[platform];
  var finalPrice = (window.app.price - share).toFixed(2);

  var platformShare = (window.app.price - finalPrice).toFixed(2);
  var platformProfit = (window.app.expectedSales[platform] * platformShare).toFixed(2);

  var profit = window.app.expectedSales[platform] * finalPrice;

  if (includeFunding === true) {
    profit += window.app.funding;
  }

  profit = profit.toFixed(2);

  return {
    totalSales: totalSales,
    finalPrice: finalPrice,
    platformShare: platformShare,
    platformProfit: platformProfit,
    profit: profit
  };
}

function displayPlatformResult (platform, results, displayBonusHint = false) {
// Create a new platform profit from the template
  var $allPlatformResults = document.querySelector('.platform-results');
  var $resultTemplate = document.querySelector('.platform-result-template');
  var $newPlatform = $resultTemplate.cloneNode(true);

  $newPlatform.querySelectorAll('.platform-name').forEach(function ($element) {
    $element.innerHTML = window.app.platforms[platform];
  });

  $newPlatform.querySelector('.result-sales-total').innerHTML = formatNumber(results.totalSales);
  $newPlatform.querySelector('.result-single-profit').innerHTML = formatNumber(results.finalPrice);
  $newPlatform.querySelector('.result-platform-single-profit').innerHTML = formatNumber(results.platformShare);
  $newPlatform.querySelector('.result-platform-total-profit').innerHTML = formatNumber(results.platformProfit);
  $newPlatform.querySelector('.result-final-profit').innerHTML = formatNumber(results.profit);

  if (displayBonusHint) {
    $newPlatform.querySelector('.result-bonushint').style.display = 'block';
  }

  $newPlatform.className = 'result';

  $allPlatformResults.appendChild($newPlatform);

  return $newPlatform;
}

/**
 * Calculate the values for the epic store
 */
function calculateEpicProfits () {
  var results = calculateSales('epic', true);
  var $epicResults = displayPlatformResult('epic', results, true);

  document.querySelector('.platform-results').style.display = 'block';

  scrollToElement($epicResults);
}

/**
 * Calculate the values for each additional platform
 */
function calculatePlatformProfits () {
  for (var key in window.app.expectedSales) {
    if (window.app.expectedSales.hasOwnProperty(key) && key !== 'epic') {

      if (window.app.expectedSales[key] === 0) {
        // Do not calculate unselected platforms
        continue;
      }

      var results = calculateSales(key);

      // Add the platform profit to the total profit
      window.app.platformProfits += results.profit;

      // Display the reults
      var $platformResults = displayPlatformResult(key, results, true);
    }
  }
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
      calculatePlatformProfits();

      // Calculate the difference between the profits

    }, 2000);

  });
};
