function openMenu(){
  document.getElementById("menuOverlay").classList.add("active");
}

function closeMenu(){
  document.getElementById("menuOverlay").classList.remove("active");
}


 const salePriceInput = document.getElementById("salePrice");
  const modelSelect = document.getElementById("modelSelect");
  const yearButtons = document.querySelectorAll(".year-btn");
  const edgeRateCheckbox = document.getElementById("edgeRate");
  const rateLabel = document.getElementById("rateLabel");
  const bankRange = document.getElementById("bankRange");
  const rangeValue = document.getElementById("rangeValue");
  const bankPercentText = document.getElementById("bankPercentText");

  const monthlyPaymentEl = document.getElementById("monthlyPayment");
  const clientDownPaymentEl = document.getElementById("clientDownPayment");
  const minimumIncomeEl = document.getElementById("minimumIncome");
  const clearBtn = document.getElementById("clearBtn");

  let selectedYears = 25;

  function parseCurrency(value) {
    if (!value) return 0;
    return Number(value.toString().replace(/[^0-9.]/g, "")) || 0;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value || 0);
  }

  function formatInputCurrency(input) {
    const raw = parseCurrency(input.value);
    input.value = raw ? formatCurrency(raw) : "";
  }

  function getAnnualRate() {
    // checked = EDGE preferential rate
    if (edgeRateCheckbox.checked) {
      rateLabel.textContent = "Escenario pesimista EDGE - 9.75% anual";
      return 9.75;
    } else {
      // example normal rate
      rateLabel.textContent = "Tasa regular - 12.00% anual";
      return 12.0;
    }
  }

  function calculateMonthlyPayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 12 / 100;
    const totalPayments = years * 12;

    if (principal <= 0 || totalPayments <= 0) return 0;

    if (monthlyRate === 0) {
      return principal / totalPayments;
    }

    const factor = Math.pow(1 + monthlyRate, totalPayments);

    return principal * monthlyRate * factor / (factor - 1);
  }

  function calculateFinance() {
    const salePrice = parseCurrency(salePriceInput.value);
    const bankPercent = Number(bankRange.value); // ex: 70
    const annualRate = getAnnualRate();

    rangeValue.textContent = `${bankPercent}%`;
    bankPercentText.textContent = `${bankPercent}%`;

    if (!salePrice || salePrice <= 0) {
      monthlyPaymentEl.textContent = formatCurrency(0);
      clientDownPaymentEl.textContent = formatCurrency(0);
      minimumIncomeEl.textContent = formatCurrency(0);
      return;
    }

    // Bank financed amount
    const financedAmount = salePrice * (bankPercent / 100);

    // Client down payment
    const clientDownPayment = salePrice - financedAmount;

    // Monthly payment
    const monthlyPayment = calculateMonthlyPayment(
      financedAmount,
      annualRate,
      selectedYears
    );

    // Minimum income = monthly payment / 30%
    const minimumIncome = monthlyPayment / 0.30;

    monthlyPaymentEl.textContent = formatCurrency(monthlyPayment);
    clientDownPaymentEl.textContent = formatCurrency(clientDownPayment);
    minimumIncomeEl.textContent = formatCurrency(minimumIncome);
  }

  // model select -> auto fill price
  modelSelect.addEventListener("change", function () {
    if (this.value) {
      salePriceInput.value = formatCurrency(Number(this.value));
      calculateFinance();
    }
  });

  // input typing
  salePriceInput.addEventListener("input", calculateFinance);
  salePriceInput.addEventListener("blur", function () {
    formatInputCurrency(salePriceInput);
    calculateFinance();
  });

  // years buttons
  yearButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      yearButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      selectedYears = Number(this.dataset.years);
      calculateFinance();
    });
  });

  // rate toggle
  edgeRateCheckbox.addEventListener("change", calculateFinance);

  // bank range
  bankRange.addEventListener("input", calculateFinance);

  // clear button
  clearBtn.addEventListener("click", function () {
    salePriceInput.value = "";
    modelSelect.value = "";
    bankRange.value = 50;
    selectedYears = 25;

    yearButtons.forEach((b) => b.classList.remove("active"));
    document.querySelector('.year-btn[data-years="25"]').classList.add("active");

    edgeRateCheckbox.checked = true;
    calculateFinance();
  });

  // initial load
  calculateFinance();