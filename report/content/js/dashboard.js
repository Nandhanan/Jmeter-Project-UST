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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6619706706211896, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6727772685609532, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?signOff=true"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/webtours/header.html"], "isController": false}, {"data": [0.6298031865042174, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?page=menu&in=flights"], "isController": false}, {"data": [0.5882629107981221, 500, 1500, "http://localhost:1080/cgi-bin/reservations.pl?page=welcome"], "isController": false}, {"data": [0.6068376068376068, 500, 1500, "http://localhost:1080/cgi-bin/login.pl?intro=true"], "isController": false}, {"data": [0.6230121608980356, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?page=search"], "isController": false}, {"data": [0.5909807631661936, 500, 1500, "http://localhost:1080/cgi-bin/reservations.pl"], "isController": false}, {"data": [0.6221374045801527, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?page=menus"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/WebTours/home.html"], "isController": false}, {"data": [0.6081560283687943, 500, 1500, "http://localhost:1080/webtours/"], "isController": false}, {"data": [0.6271808999081726, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?in=home"], "isController": false}, {"data": [0.6402777777777777, 500, 1500, "http://localhost:1080/cgi-bin/login.pl"], "isController": false}, {"data": [0.6211692597831212, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?page=menu&in=home"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 18207, 0, 0.0, 692.3821607074187, 0, 8794, 663.0, 1051.0, 1173.0, 4371.359999999986, 86.64471242159765, 145.12301339561898, 51.1721742881923], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["http://localhost:1080/cgi-bin/welcome.pl?signOff=true", 1091, 0, 0.0, 616.5389550870761, 62, 1505, 611.0, 939.0, 1010.3999999999999, 1220.3199999999997, 5.196945663098828, 5.2020208053479475, 2.669524823037093], "isController": false}, {"data": ["http://localhost:1080/webtours/header.html", 1091, 0, 0.0, 1.1448212648945941, 0, 171, 1.0, 1.0, 1.0, 22.079999999999927, 5.203514160617362, 5.117127695060239, 2.617001750701115], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?page=menu&in=flights", 1067, 0, 0.0, 692.9925023430183, 165, 1562, 713.0, 1017.0, 1098.1999999999998, 1290.2799999999997, 5.123034449645901, 8.750182863701836, 2.791653537990637], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/reservations.pl?page=welcome", 1065, 0, 0.0, 779.5906103286386, 205, 1545, 802.0, 1084.4, 1179.7999999999997, 1340.0599999999993, 5.119158631430192, 22.596257982162257, 2.7945406982123804], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/login.pl?intro=true", 2106, 0, 0.0, 736.2374169040833, 195, 1691, 757.0, 1056.0, 1132.2999999999997, 1294.2999999999984, 10.084081898450519, 11.364287608214743, 5.416254925925571], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/welcome.pl?page=search", 1069, 0, 0.0, 689.4677268475211, 157, 1598, 705.0, 1013.0, 1089.0, 1273.3, 5.126999961631432, 4.220762663725876, 2.7687802527169745], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/reservations.pl", 3171, 0, 0.0, 774.1835383159888, 193, 1883, 803.0, 1088.0, 1166.0, 1348.119999999999, 15.275964563230739, 41.66182417947693, 12.429861716631098], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/welcome.pl?page=menus", 1048, 0, 0.0, 701.8187022900764, 152, 1650, 709.0, 1024.0, 1108.55, 1303.04, 5.074790204880127, 4.078664393180024, 2.7356290948181936], "isController": false}, {"data": ["http://localhost:1080/WebTours/home.html", 1081, 0, 0.0, 59.25809435707674, 0, 219, 57.0, 65.0, 72.0, 171.18000000000006, 5.171877616439012, 8.379047818039377, 2.732407998528814], "isController": false}, {"data": ["http://localhost:1080/webtours/", 1128, 0, 0.0, 1653.3031914893613, 1, 8794, 102.0, 5552.8, 6748.249999999997, 8062.97, 5.372196028004001, 3.483533361908844, 2.644127732533219], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?in=home", 1089, 0, 0.0, 681.1322314049589, 176, 1414, 683.0, 1002.0, 1089.5, 1288.2999999999988, 5.196924794914745, 8.904634536046807, 2.765941419168492], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/login.pl", 1080, 0, 0.0, 673.7064814814819, 98, 1468, 692.0, 992.9, 1076.8500000000001, 1237.4700000000007, 5.162129091465279, 5.2175816500650045, 3.6901157177271333], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?page=menu&in=home", 2121, 0, 0.0, 700.7463460631776, 157, 1526, 717.0, 1014.0, 1098.0, 1291.0, 10.140610731548726, 17.320242353006567, 5.49613179297807], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 18207, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
