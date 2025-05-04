// Color Variables
var primaryColorShade = '#836AF9',
    yellowColor = '#ffe800',
    successColorShade = '#28dac6',
    warningColorShade = '#ffe802',
    warningLightColor = '#FDAC34',
    infoColorShade = '#299AFF',
    greyColor = '#4F5D70',
    blueColor = '#2c9aff',
    blueLightColor = '#84D0FF',
    greyLightColor = '#EDF1F4',
    tooltipShadow = 'rgba(0, 0, 0, 0.25)',
    lineChartPrimary = '#666ee8',
    lineChartDanger = '#ff4961',
    labelColor = '#6e6b7b',
    grid_line_color = 'rgba(200, 200, 200, 0.2)'; // RGBA color helps in dark layout


var dashboard = {
    yMax: 0,
    data: null,
    lostVal: 0.0,
    nsvVal: 0.0,
    conLost: 0.0,
    conRecovered: 0.0,
    ownLost: 0.0,
    ownRecovered: 0.0,
    nsvLost: 0.0,
    nsvRecovered: 0.0,
    scatterData: null,
    daysData: 7,//data of total number of days
    resetDashboardData: function () {
        dashboard.yMax = 0;
        dashboard.data = null;
        dashboard.lostVal = 0.0;
        dashboard.nsvVal = 0.0;
        dashboard.conLost = 0.0;
        dashboard.conRecovered = 0.0;
        dashboard.ownLost = 0.0;
        dashboard.ownRecovered = 0.0;
        dashboard.nsvLost = 0.0;
        dashboard.nsvRecovered = 0.0;
        dashboard.scatterData = null;
        dashboard.daysData = 7;//data of total number of days
    },
    renderGraphs: function () {
        dashboard.getIncidentData();//get Incident data to plot the anlytics dots graph
        dashboard.getFloorData();
        dashboard.loadIncidentGrid();
    },
    loaddashboard: function () {
        dashboard.resetDashboardData();
        common.loadhtmlcallback = dashboard.renderDashboard;
        common.loadhtml('dashboard/dashboard.html', $('#page-content-body'));
        common.updatenavigation('dashboard');
    },
    buildFloorData: function (d) {
        console.log("===========FLOOR DATA===========");
        console.log(d);
        console.log("===========FLOOR DATA===========");
        var data = [];
        for (var i = -1; i <= 4; i++) {//loop through all floors
            var count = 0;
            for (var m = 0; m <= d.length - 1; m++) {//loop through all data and find the floors
                if (m == dashboard.daysData)
                    break;
                if (d[m].length == 0)
                    continue;
                var data_filter = d[m].dayAnalysis.filter(element => element.floor == i)
                count += dashboard.dayCount(data_filter);
            }
            data.push(count);
        }
        return data;
    },
    dayCount: function (d, floor) {
        var val =0;
        for (var x = 0; x <= d.length - 1; x++) {
            val += d[x].count;
        }
        return val;
    },
    renderFloorGraph: function (days, d) {
        var _data = dashboard.buildFloorData(d);
        var polarAreaChartEx = $('.polar-area-chart-ex');
        var polarExample = new Chart(polarAreaChartEx, {
            type: 'polarArea',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                responsiveAnimationDuration: 500,
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 25,
                        boxWidth: 9,
                        fontColor: labelColor
                    }
                },
                layout: {
                    padding: {
                        top: -5,
                        bottom: -45
                    }
                },
                tooltips: {
                    // Updated default tooltip UI
                    shadowOffsetX: 1,
                    shadowOffsetY: 1,
                    shadowBlur: 8,
                    shadowColor: tooltipShadow,
                    backgroundColor: window.colors.solid.white,
                    titleFontColor: window.colors.solid.black,
                    bodyFontColor: window.colors.solid.black
                },
                scale: {
                    scaleShowLine: true,
                    scaleLineWidth: 1,
                    ticks: {
                        display: false,
                        fontColor: labelColor
                    },
                    reverse: false,
                    gridLines: {
                        display: false
                    }
                },
                animation: {
                    animateRotate: false
                },
                onClick: function (evt) {
                    var element = polarExample.getElementAtEvent(evt);
                    if (element.length > 0) {
                        var ind = element[0]._index-1;
                        var dSet = element[0]._datasetIndex;
                        dashboard.loadFloorData(ind);
                    }
                }
            },
            data: {
                labels: ['Basement', 'Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor'],
                datasets: [
                    {
                        label: 'Floor wise incidents',
                        backgroundColor: [
                            primaryColorShade,
                            warningColorShade,
                            window.colors.solid.primary,
                            infoColorShade,
                            greyColor,
                            successColorShade
                        ],
                        data: _data,
                        borderWidth: 0
                    }
                ]
            }
        });
    },
    buildGraphData: function (days, data) {
        this.data = data;//get this data from server
        var colors = ['#99b433', '#1e7145', '#603cba','#ff0097', '#00a300','#9f00a7', '#7e3878',  '#00aba9', '#eff4ff', '#2d89ef'];
        var names = getTopTen(this.data, days);
        var obj = {};
        var _DS = {
            label: 'iPhone',
            data: [],
            borderColor: 'transparent',
            backgroundColor: window.colors.solid.primary,
            pointBorderWidth: 2,
            pointHoverBorderWidth: 2,
            pointRadius: 5
        };
        var _dsArray = [];
        if (data.length < days)
            days = data.length - 1;

        for (var i = 0; i <= names.length - 1; i++) {//loop through all the top 10 incident types
            var _data = [];
            var x = $.parseJSON(JSON.stringify(_DS));
            var m = 0;
            for (var n = days; n >= 0; n--) {//loop through number of days
                var iType = lookup(this.data[n].dayAnalysis, "incidentType", names[i].id);
                var val = 0;
                if (iType != undefined)
                    val = lookup(this.data[n].dayAnalysis, "incidentType", names[i].id).count;
                var obj = { x: m, y: val };
                if (dashboard.yMax < val)//set the yMaximum number
                    dashboard.yMax = val;
                _data.push(obj);
                if (names[i].id == 1 && iType != undefined) {
                    dashboard.lostVal += iType.value;
                    dashboard.nsvVal += iType.nsv;
                }
                m++;
            }

            var obj = _DS;
            x["label"] = names[i].name;
            x["backgroundColor"] = colors[i];
            x["data"] = _data;
            x["cType"] = names[i].id;
            _dsArray.push(x);
        }
        $('#spn-nsv-value').html(dashboard.nsvVal)
        $('#spn-lost-value').html(dashboard.lostVal)
        $('#spn-total-value').html(dashboard.nsvVal + dashboard.lostVal);
        return _dsArray;
    },
    renderIncidents: function (days, d) {
        dashboard.scatterData = this.buildGraphData(days, d);
        var steps = 15;
        if (this.yMax < 50) {
            steps = 5;
        }
        if (this.yMax >= 50 && this.yMax >= 100) {
            steps = 10;
        }
        if (this.yMax < 1000 && this.yMax >= 100) {
            steps = 50;
        }
        if (this.yMax > 1000) {
            steps = 150;
        }
        this.yMax = Math.ceil(this.yMax / steps) * steps
        var lineChartEx = $('.line-chart-ex');
        var scatterExample = new Chart(lineChartEx, {
            type: 'scatter',
            plugins: [
                {
                    beforeInit: function (chart) {
                        chart.legend.afterFit = function () {
                            this.height += 20;
                        };
                    }
                }
            ],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                responsiveAnimationDuration: 800,
                tooltips: {
                    shadowOffsetX: 1,
                    shadowOffsetY: 1,
                    shadowBlur: 8,
                    shadowColor: tooltipShadow,
                    backgroundColor: window.colors.solid.white,
                    titleFontColor: window.colors.solid.black,
                    bodyFontColor: window.colors.solid.black,
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var label = data.datasets[tooltipItem.datasetIndex].label; 
                            return label + ': (' + tooltipItem.yLabel + ')';
                        }
                    }
                },
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                color: grid_line_color,
                                zeroLineColor: grid_line_color
                            },
                            ticks: {
                                callback: function (val, index) {
                                    return getDate(days+1, index);
                                },
                                color: 'red',
                            }
                        }
                    ],
                    yAxes: [
                        {
                            gridLines: {
                                color: grid_line_color,
                                zeroLineColor: grid_line_color
                            },
                            ticks: {
                                stepSize: 5,
                                min: 0,
                                max: this.yMax,
                                fontColor: labelColor
                            }
                        }
                    ]
                },
                legend: {
                    position: 'top',
                    align: 'start',
                    labels: {
                        usePointStyle: true,
                        padding: 25,
                        boxWidth: 9
                    }
                },
                layout: {
                    padding: {
                        top: -20
                    }
                },
                onClick: function (evt) {
                    var element = scatterExample.getElementAtEvent(evt);
                    if (element.length > 0) {
                        var ind = element[0]._index;
                        var dSet = element[0]._datasetIndex;
                        dashboard.loadIncidentFromGraph(ind, dSet);
                    }
                }
            },
            data: {
                datasets: dashboard.scatterData
            }
        });
        dashboard.computeLostRecover(days, d);
    },
    loadFloorData: function (floor) {
        var d = getUTCDate();
        var eDate = YYYYMMDD(d);
        d = d.setDate(d.getDate() - dashboard.daysData);
        var dn = new Date(d);
        var sDate = YYYYMMDD(dn);
        var d = { 'floor': floor.toString(), 'startdate': sDate, 'enddate': eDate };
        incidents.generateReportGrid(d);
    },
    loadIncidentFromGraph: function (ind, dInd) {
        var nType = dashboard.scatterData[dInd].cType;
        var date = getDate1(dashboard.daysData, ind);
        var d = { 'naturetype': nType.toString(), 'startdate': date, 'enddate': date, 'agentid': '', 'departmentid': '' };
        incidents.generateReportGrid(d);

    },
    renderHandOvers: function (data) {
        if (data.length == 0) {
            $("#handoverList").html("<h2 class='text-warning'>No Handover found for today!</h2>");
            return;
        }
        var d = {
            handovers: data
        };
        for (var i = 0; i <= d.handovers.length - 1; i++) {
            d.handovers[i]["time"] = common.updateTime(d.handovers[i]["dateUpdated"]);
            d.handovers[i]["agentname"] = user.findUsers("objectId", d.handovers[i].agentId).name;
        }

        var template = $("#handoverTemplate").html();
        var text = Mustache.render(template, d);
        $("#handoverList").html(text);
    },
    renderDashboard: function () {
        dashboard.renderGraphs();
        //common.getApi("Handovers/GetHandovers", dashboard.renderHandOvers);
    },
    getIncidentData: function () {
        common.getApi("AnalyticsData/GetAllData", dashboard.makeIncidentData);
    },
    getFloorData: function () {
        common.getApi("AnalyticsData/GetAllFloorData", dashboard.makeFloorData);
    },
    makeFloorData: function (d) {
        dashboard.renderFloorGraph(dashboard.daysData, d);//
    },
    makeIncidentData: function (d) {
        console.log("===========MAKEINCIDENTDATA===========");
        console.log(d);
        console.log("===========MAKEINCIDENTDATA===========");
        dashboard.renderIncidents(dashboard.daysData, d);//
    },
    loadIncidentGrid: function () {
        var d = getUTCDate();
        var eDate = YYYYMMDD(d);
        d = d.setDate(d.getDate() - dashboard.daysData);
        var dn = new Date(d);
        var sDate = YYYYMMDD(dn);
        var d = { 'naturetype': '', 'startdate': sDate, 'enddate': eDate, 'agentid': '', 'departmentid': '' };
        incidents.generateReportGrid(d);
    },
    computeLostRecover: function (days, d) {
        if (d.length < days)
            days = d.length - 1;
        for (let n = 0; n <= days; n++) {
            dashboard.conLost += d[n].conLost;
            dashboard.conRecovered += d[n].conRecovered;
            dashboard.ownLost += d[n].ownLost;
            dashboard.ownRecovered += d[n].ownRecovered;
            dashboard.nsvLost += d[n].nsvLost;
            dashboard.nsvRecovered += d[n].nsvRecovered;
        }
        $('#spn-own-lost').html(dashboard.ownLost);
        $('#spn-own-recovered').html(dashboard.ownRecovered);
        $('#spn-con-lost').html(dashboard.conLost);
        $('#spn-con-recovered').html(dashboard.conRecovered);
        $('#spn-nsv-lost').html(dashboard.nsvLost);
        $('#spn-nsv-recovered').html(dashboard.nsvRecovered);

        var totalLost = dashboard.conLost + dashboard.ownLost + dashboard.nsvLost
        var totalRecover = dashboard.conRecovered + dashboard.ownRecovered + dashboard.nsvRecovered
        $('#spn-total-lost').html(totalLost);
        $('#spn-total-recovered').html(totalRecover);
    }
}

function getDate(totalDays, index) {
    date = getUTCDate();
    var d = parseInt(totalDays) - parseInt(index);
    date.setDate(date.getDate() - d);
    return date.getDate() + "/" + (parseInt( date.getMonth()) + 1);
}

function getDate1(totalDays, index) {
    date = getUTCDate();
    var d = parseInt(totalDays) - parseInt(index);
    date.setDate(date.getDate() - d);
    return date.getDate() + "/" + (parseInt(date.getMonth()) + 1) + "/" + date.getFullYear();
}

function getUTCDate() {
    var date = new Date().toISOString();
    date = date.substring(0, date.length - 1);
    return new Date(date);
}

function YYYYMMDD(d) {
    return d.getFullYear() + '-' + (parseInt(d.getMonth()) + 1) + '-' + d.getDate();
}

function getTopTen(d, days) {
    var a = [];
    if (d.length < days)
        days = d.length-1;
    for (var n = 0; n <= days; n++) {
        var dayAnalysis = d[n].dayAnalysis;
        for (var i = 0; i <= d[n].dayAnalysis.length - 1; i++) {
            var name = enums.CallType[d[n].dayAnalysis[i].incidentType-1]["name"];
            var val = 0;
            if (a[name] != undefined || a[name] == "")
                val = parseInt(a[name]);
            a[name] = val + parseInt(dayAnalysis[i].count);
        }
    }
    var top10 = [];
    var count = 0;

    var _name = 'Theft';
    var val = parseInt(a[_name]);
    if (isNaN(val)) val = 0;//if no theft is found add 0 to the value
    var obj = { "name": _name + "(" + val + ")", "id": 1 };//add Theft as predefined incident type
    top10.push(obj);
    delete a[_name];//remove Theft after adding it

    var _name = 'Recovery';
    var val = parseInt(a[_name]);
    if (isNaN(val)) val = 0;//if no recovery is found add 0 to the value
    var obj = { "name": _name + "(" + val + ")", "id": 3 };//add Recovery as predefined incident type
    top10.push(obj);
    delete a[_name];//remove Recovery after adding it
    _name = '';
    
    for (var m = 0; m <= 7; m++) {
        for (var i = 0; i <= enums.CallType.length - 1; i++) {
            var name = enums.CallType[i]["name"];
            if (a[name] == undefined)//validate if name is found out
                continue;
            var val = parseInt(a[name]);
            if (val == NaN) val = 0;//if no recovery is found add 0 to the value
            if (count < val) {
                _name = name;
                count = val;
            }
        }
        if (_name != "") {
            var obj = { "name": _name + "(" + count + ")", "id": enums.getEVal("calltype", _name).number }
            top10.push(obj);
        }
        delete a[_name];
        _name = '';
        count = 0;
    }
    return top10;
}
//var a = makeData();