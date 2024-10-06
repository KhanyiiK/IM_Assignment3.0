// Global variables
let marsData = {};
let currentSolIndex = 0;

// Function to handle smooth scrolling
function smoothScroll(target, duration) {
  var targetElement = document.querySelector(target);
  var targetPosition =
    targetElement.getBoundingClientRect().top + window.pageYOffset;
  var startPosition = window.pageYOffset;
  var distance = targetPosition - startPosition;
  var startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    var timeElapsed = currentTime - startTime;
    var run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
}

// Wait for the DOM to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function () {
  var exploreBtn = document.getElementById("explore-btn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", function () {
      smoothScroll("#weather-guide", 1000); // Scroll to weather-guide section over 1 second
    });
  }

  // Mobile menu toggle functionality
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  navToggle.addEventListener("click", function () {
    navLinks.classList.toggle("show");
    this.classList.toggle("active");
  });

  // Close mobile menu when a link is clicked
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("show");
      navToggle.classList.remove("active");
    });
  });

  // Highlight active nav link based on scroll position
  window.addEventListener("scroll", highlightNavLink);

  // Guide item animation
  animateGuideItems();

  // Fetch Mars weather data
  fetchMarsWeather();
});

// Function to highlight the active navigation link based on scroll position
function highlightNavLink() {
  const sections = document.querySelectorAll("section");
  let scrollPosition = window.pageYOffset;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.clientHeight;
    const sectionId = section.getAttribute("id");

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        }
      });
    }
  });
}

// Function to animate guide items as they come into view
function animateGuideItems() {
  const guideItems = document.querySelectorAll(".guide-item");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );

  guideItems.forEach((item) => {
    item.style.opacity = 0;
    item.style.transform = "translateY(20px)";
    item.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(item);
  });
}

// Function to fetch Mars weather data from the NASA API
function fetchMarsWeather() {
  const apiKey = "a5jKvoT8qQNtWTzVuUtSUNNcRf1Ic0rpUNIgkJWw";
  const apiUrl = `https://api.nasa.gov/insight_weather/?api_key=${apiKey}&feedtype=json&ver=1.0`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("Data received:", data);
      marsData = data;
      currentSolIndex = data.sol_keys.length - 1;
      displayDashboard();
    })
    .catch((error) => {
      console.error("Error fetching Mars weather data:", error);
      document.getElementById("loading").style.display = "none";
      document.getElementById("weather-error").style.display = "block";
    });
}

// Function to display the weather dashboard
function displayDashboard() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("weather-dashboard").style.display = "block";
  updateDashboard();
}

// Function to update the dashboard with current sol data
function updateDashboard() {
  const solKey = marsData.sol_keys[currentSolIndex];
  const solData = marsData[solKey];

  document.getElementById("current-sol").textContent = `Sol ${solKey}`;
  document.getElementById("current-earth-date").textContent = new Date(
    solData.First_UTC
  ).toLocaleDateString();
  document.getElementById("current-season").textContent = `Season: ${
    solData.Season || "N/A"
  }`;

  updateTemperature(solData);
  updateWind(solData);
  updatePressure(solData);
  updateInfoCard(solData);

  // Disable navigation buttons if at the start or end of the data
  document.getElementById("prev-sol").disabled = currentSolIndex === 0;
  document.getElementById("next-sol").disabled =
    currentSolIndex === marsData.sol_keys.length - 1;
}

// Function to update temperature data and chart
function updateTemperature(solData) {
  const tempCard = document.getElementById("temperature-card");
  if (solData.AT) {
    tempCard.querySelector("#avg-temp").textContent = `${solData.AT.av.toFixed(
      1
    )}°C`;
    tempCard.querySelector(
      "#min-temp"
    ).textContent = `Min: ${solData.AT.mn.toFixed(1)}°C`;
    tempCard.querySelector(
      "#max-temp"
    ).textContent = `Max: ${solData.AT.mx.toFixed(1)}°C`;
    updateTemperatureChart();
  } else {
    tempCard.querySelector("#avg-temp").textContent = "N/A";
    tempCard.querySelector("#min-temp").textContent = "Min: N/A";
    tempCard.querySelector("#max-temp").textContent = "Max: N/A";
  }
}

// Function to update wind data and chart
function updateWind(solData) {
  const windCard = document.getElementById("wind-card");
  if (solData.HWS) {
    windCard.querySelector(
      "#wind-speed"
    ).textContent = `${solData.HWS.av.toFixed(1)} m/s`;
    updateWindSpeedChart();
  } else {
    windCard.querySelector("#wind-speed").textContent = "N/A";
  }
}

// Function to update pressure data and chart
function updatePressure(solData) {
  const pressureCard = document.getElementById("pressure-card");
  if (solData.PRE) {
    pressureCard.querySelector(
      "#pressure"
    ).textContent = `${solData.PRE.av.toFixed(0)} Pa`;
    updatePressureChart();
  } else {
    pressureCard.querySelector("#pressure").textContent = "N/A";
  }
}

// Function to update the info card with animation
function updateInfoCard() {
  const infoItems = document.querySelectorAll(".info-item");
  infoItems.forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.add("active");
      setTimeout(() => item.classList.remove("active"), 300);
    });
  });
}

function updateTemperatureChart() {
  const chartData = marsData.sol_keys
    .map((sol) => ({
      sol: sol,
      avg: marsData[sol].AT ? marsData[sol].AT.av : null,
      min: marsData[sol].AT ? marsData[sol].AT.mn : null,
      max: marsData[sol].AT ? marsData[sol].AT.mx : null,
    }))
    .filter((d) => d.avg !== null);

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 300 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  d3.select("#temp-chart").selectAll("*").remove();

  const svg = d3
    .select("#temp-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().range([0, width]).padding(0.1);

  const y = d3.scaleLinear().range([height, 0]);

  x.domain(chartData.map((d) => d.sol));
  y.domain([
    d3.min(chartData, (d) => d.min) - 5,
    d3.max(chartData, (d) => d.max) + 5,
  ]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % 2))));

  svg.append("g").call(d3.axisLeft(y));

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg
    .selectAll(".bar-avg")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("class", "bar-avg")
    .attr("x", (d) => x(d.sol))
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d.avg))
    .attr("height", (d) => height - y(d.avg))
    .attr("fill", "#ff6b6b")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `Sol: ${d.sol}<br/>Avg: ${d.avg.toFixed(
            1
          )}°C<br/>Min: ${d.min.toFixed(1)}°C<br/>Max: ${d.max.toFixed(1)}°C`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  svg
    .selectAll(".error-bar")
    .data(chartData)
    .enter()
    .append("line")
    .attr("class", "error-bar")
    .attr("x1", (d) => x(d.sol) + x.bandwidth() / 2)
    .attr("x2", (d) => x(d.sol) + x.bandwidth() / 2)
    .attr("y1", (d) => y(d.min))
    .attr("y2", (d) => y(d.max))
    .attr("stroke", "white")
    .attr("stroke-width", 2);
}

function updateWindSpeedChart() {
  const chartData = marsData.sol_keys
    .map((sol) => ({
      sol: sol,
      speed: marsData[sol].HWS ? marsData[sol].HWS.av : null,
    }))
    .filter((d) => d.speed !== null);

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 300 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  d3.select("#wind-speed-chart").selectAll("*").remove();

  const svg = d3
    .select("#wind-speed-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().range([0, width]).padding(0.1);

  const y = d3.scaleLinear().range([height, 0]);

  x.domain(chartData.map((d) => d.sol));
  y.domain([0, d3.max(chartData, (d) => d.speed) * 1.2]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % 2))));

  svg.append("g").call(d3.axisLeft(y));

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg
    .append("path")
    .datum(chartData)
    .attr("fill", "none")
    .attr("stroke", "#4ecdc4")
    .attr("stroke-width", 2)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.sol) + x.bandwidth() / 2)
        .y((d) => y(d.speed))
    );

  svg
    .selectAll(".dot")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => x(d.sol) + x.bandwidth() / 2)
    .attr("cy", (d) => y(d.speed))
    .attr("r", 4)
    .attr("fill", "#4ecdc4")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(`Sol: ${d.sol}<br/>Wind Speed: ${d.speed.toFixed(1)} m/s`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

function updatePressureChart() {
  const chartData = marsData.sol_keys
    .map((sol) => ({
      sol: sol,
      pressure: marsData[sol].PRE ? marsData[sol].PRE.av : null,
    }))
    .filter((d) => d.pressure !== null);

  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 300 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  d3.select("#pressure-chart").selectAll("*").remove();

  const svg = d3
    .select("#pressure-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().range([0, width]).padding(0.1);

  const y = d3.scaleLinear().range([height, 0]);

  x.domain(chartData.map((d) => d.sol));
  y.domain([
    d3.min(chartData, (d) => d.pressure) - 10,
    d3.max(chartData, (d) => d.pressure) + 10,
  ]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % 2))));

  svg.append("g").call(d3.axisLeft(y));

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg
    .append("path")
    .datum(chartData)
    .attr("fill", "none")
    .attr("stroke", "#ff6b6b")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.sol) + x.bandwidth() / 2)
        .y((d) => y(d.pressure))
    );

  svg
    .selectAll(".dot")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => x(d.sol) + x.bandwidth() / 2)
    .attr("cy", (d) => y(d.pressure))
    .attr("r", 3)
    .attr("fill", "#ff6b6b")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(`Sol: ${d.sol}<br/>Pressure: ${d.pressure.toFixed(0)} Pa`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

document.getElementById("prev-sol").addEventListener("click", () => {
  if (currentSolIndex > 0) {
    currentSolIndex--;
    updateDashboard();
  }
});

document.getElementById("next-sol").addEventListener("click", () => {
  if (currentSolIndex < marsData.sol_keys.length - 1) {
    currentSolIndex++;
    updateDashboard();
  }
});

fetchMarsWeather();
