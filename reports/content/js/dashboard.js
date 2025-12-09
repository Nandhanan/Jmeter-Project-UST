/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.99500934240135, "KoPercent": 0.004990657598660091};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9999431010191362, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9999431010191362, 500, 1500, "JDBC Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3646814, 182, 0.004990657598660091, 1.0222413317486996, 0, 41306, 0.0, 1.0, 1.0, 4.0, 15195.248273936757, 1439.3936353240872, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["JDBC Request", 3646814, 182, 0.004990657598660091, 1.0222413317486996, 0, 41306, 0.0, 1.0, 1.0, 4.0, 15195.248273936757, 1439.3936353240872, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 25,698 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 14,598 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 38,404 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,727 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 14,830 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,309 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,045 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,571 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,211 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,842 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 17,365 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,064 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 21,524 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,006 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,414 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,516 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 40,930 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,351 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,909 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,137 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 36,082 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,111 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 13,628 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 41,306 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,157 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 35,828 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,528 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,667 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,884 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 30,476 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,151 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,722 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,454 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,465 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 33,400 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,787 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,351 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,163 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,704 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,589 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 20,922 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,795 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,203 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 30,518 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 14,652 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,512 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,518 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,364 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, 1.098901098901099, 5.484239119406693E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,703 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 23,293 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,440 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,240 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,462 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 40,161 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,980 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,519 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,653 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,021 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,312 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,467 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,927 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,713 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 19,720 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,062 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,538 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,371 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 35,809 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,116 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,340 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 31,684 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 11,634 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,355 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,282 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,937 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,719 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,797 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 38,450 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,007 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,793 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 13,503 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,388 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,542 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 23,045 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,469 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,259 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 14,882 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,823 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,060 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 38,472 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,608 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,925 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 17,471 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,821 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,979 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,595 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,749 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,733 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,293 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,459 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,473 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,385 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,837 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,003 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,021 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,043 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 11,782 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,555 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,746 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,432 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,905 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,567 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,792 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,463 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,360 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,077 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,845 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,322 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 18,018 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,595 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 14,643 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,684 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,312 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,336 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 11,108 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,612 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,535 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,935 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,444 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 11,540 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,129 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 14,659 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,285 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 27,619 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,383 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,302 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,467 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 25,976 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,053 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 14,562 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,534 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 19,323 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 14,462 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,811 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 21,260 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,883 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 11,374 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,904 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,809 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,260 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,938 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,364 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 11,181 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,180 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,696 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 23,914 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,940 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,105 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 33,286 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,873 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,917 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,110 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,530 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,563 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 19,431 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 11,532 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 33,416 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,171 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,638 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,864 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,356 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,367 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,352 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,953 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,248 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 38,469 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,739 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 38,447 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,677 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,000 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 32,364 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,841 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5494505494505495, 2.7421195597033464E-5], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3646814, 182, "The operation lasted too long: It took 4,364 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 25,698 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 14,598 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 38,404 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 7,727 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["JDBC Request", 3646814, 182, "The operation lasted too long: It took 4,364 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 25,698 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 14,598 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 38,404 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 7,727 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
