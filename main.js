// SETUP: Define dimensions and margins for the charts
const margin = { top: 50, right: 30, bottom: 60, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// 1: CREATE SVG CONTAINERS
const svgLine = d3.select("#lineChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 2: LOAD DATA
d3.csv("movies.csv").then(data => {
    // 2.a: Reformat Data
    data.forEach(d => {
        d.score = +d.imdb_score;
        d.year = +d.title_year;
        d.director = d.director_name;
        d.gross = d.gross ? +d.gross : 0; // Handle missing values
    });

    console.log(data);

    // 3: PREPARE LINE CHART DATA (Total Gross by Year)
    const validData = data.filter(d => !isNaN(d.gross) && d.gross > 0 && d.year >= 2010);

    // 3.b: Group by year and summarize
    const aggregated = d3.rollup(validData,
        v => d3.sum(v, d => d.gross),
        d => d.year
    );

    // 3.c: Convert to an array and sort by year
    const lineData = Array.from(aggregated, ([year, totalGross]) => ({ year, totalGross }))
                            .sort((a, b) => a.year - b.year);

    console.log(lineData);

    // 4: SET SCALES
    const xScale = d3.scaleLinear()
        .domain([2010, d3.max(lineData, d => d.year)])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(lineData, d => d.totalGross)])
        .range([height, 0]);

    // 4.c: Define line generator
    const lineGenerator = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.totalGross));

    // 5: PLOT LINE
    svgLine.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", lineGenerator);

    // 6: ADD AXES
    svgLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale) // Use xScale instead of xLine
            .tickFormat(d3.format("d")) // Format years correctly
        );

    svgLine.append("g")
    .call(d3.axisLeft(yScale) // Use yScale instead of yLine
        .tickValues(d3.range(0, d3.max(lineData, d => d.totalGross), 1_000_000_000)) // Force 1B increments
        .tickFormat(d => `${d / 1_000_000_000}B`) // Format in billions
    );




    // 7: ADD LABELS
    svgLine.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("class", "title")
        .text("Trends in Total Gross Revenue");

    svgLine.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("class", "axis-label")
        .text("Year");

    svgLine.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("class", "axis-label")
        .text("Total Gross Revenue (Billions)");
});
