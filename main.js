// SETUP: Define dimensions and margins for the charts
const margin = { top: 50, right: 30, bottom: 60, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// 1: CREATE SVG CONTAINERS
// 1: Line Chart Container
const svgLine = d3.select("#lineChart")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 2: LOAD DATA
d3.csv("movies.csv").then(data => {
    // 2.a: Reformat Data
    data.forEach(d => {
        d.score = +d.imdb_score;   // Convert score to a number
        d.year = +d.title_year;    // Convert year to a number
        d.director = d.director_name;
        d.gross = +d.gross;        // Convert gross to a number
    });

    console.log(data);

    /* ===================== LINE CHART: Total Gross by Year ===================== */

    // 3: PREPARE LINE CHART DATA (Total Gross by Year)
    // 3.a: Filter out entries with null or 0 gross and missing year
    const validData = data.filter(d => !isNaN(d.gross) && d.gross > 0 && d.year);

    // 3.b: Group by year and summarize (aggregate gross by year)
    const aggregated = d3.rollup(validData,
        v => d3.sum(v, d => d.gross),
        d => d.year
    );

    // 3.c: Convert to an array and sort by year
    const lineData = Array.from(aggregated, ([year, totalGross]) => ({ year, totalGross }))
                            .sort((a, b) => a.year - b.year);

    console.log(lineData);

    // 4: SET SCALES FOR LINE CHART
    // 4.a: X scale (Year)
    const xScale = d3.scaleLinear()
        .domain(d3.extent(lineData, d => d.year))
        .range([0, width]);
    
    // 4.b: Y scale (Gross)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(lineData, d => d.totalGross)])
        .range([height, 0]);

    // 4.c: Define line generator for plotting line
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

    // 6: ADD AXES FOR LINE CHART
    // 6.a: X-axis (Year)
    svgLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    // 6.b: Y-axis (Gross)
    svgLine.append("g")
        .call(d3.axisLeft(yScale));

    // 7: ADD LABELS FOR LINE CHART
    // 7.a: Chart Title
    svgLine.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("class", "title")
        .text("Total Gross by Year");

    // 7.b: X-axis label (Year)
    svgLine.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("class", "axis-label")
        .text("Year");

    // 7.c: Y-axis label (Total Gross)
    svgLine.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("class", "axis-label")
        .text("Total Gross");
});