var myApp = angular.module("myApp", ['ngAnimate', 'ui.bootstrap']);

myApp.controller("DashboardController", function($scope, $http) {

    // OnInit,
    $scope.options = {
        role: ['', '부모', '교사', '학생'],
        country: ['', '한국', '일본']
    };

    // OnStart,
    $scope.tab = 1;
    $scope.setTab = function(tabNum) {
        $scope.tab = tabNum;
    };

    getTotalSignedUp();
    getActive(0);

    // Function,

    // about 총 가입자 지표
    function getTotalSignedUp() {
        // getUserSignedUP
        $http({
            method: 'get',
            url: 'data/user_signedup.json'
        }).then(function (response) {
            var getSignedUp = response.data;

            // getUserDeleted
            $http({
                method: 'get',
                url: 'data/user_deleted.json'
            }).then(function (response) {
                var getDeleted = response.data;

                // Return Data (date : key_as_string, count : doc_count)
                $scope.users = new Array();
                for(var i in getSignedUp) {
                    var keys = new Object();
                    keys.index = i;
                    keys.key_as_string = getSignedUp[i].key_as_string;
                    keys.doc_signedup = getSignedUp[i].doc_count;
                    keys.doc_deleted = getDeleted[i].doc_count;
                    keys.doc_total = getSignedUp[i].doc_count - getDeleted[i].doc_count;

                    $scope.users.push(keys);
                }

                // DrawChart
                chartTotalSignedUp($scope.users);
            },function (error){
                console.log(error, 'can not get deleted data.');
            });
        },function (error){
            console.log(error, 'can not get signedup data.');
        });
    }

    function chartTotalSignedUp(users) {
        //console.log("length : " + Object.keys(users).length);
        index = parseInt(Object.keys(users).length);

        var chartTotalSignedUp = {
          "type": "bar",
          /*
          "title": {
            "text": "총가입자 지표 (최근 7일)"
          },
          */
          "plot": {
            "value-box": {
              "text": "%v"
            }
          },
          "scale-x": {
            "values": []
          },
          "series": [{
            "values": [users[index-7].doc_total,
                       users[index-6].doc_total,
                       users[index-5].doc_total,
                       users[index-4].doc_total,
                       users[index-3].doc_total,
                       users[index-2].doc_total,
                       users[index-1].doc_total],
            "palette": 0
          }]
        };

        zingchart.render({
          id: "chartTotalSignedUp",
          data: chartTotalSignedUp,
          height: "500",
          width: "100%"
        });
    }

    /*
    // 총 가입자 지표
    // View로 연결이 되질 않음
    getTotalSignedUp();
    function getTotalSignedUp() {
        var getSignedUp = new Object();;
        var getDeleted = new Object();

        var chkFlag = 0;
        getJSON = setInterval(function() {
            $.getJSON('data/user_signedup.json', function(json) {
                getSignedUp = json;

            }).done (function() {
                $.getJSON('data/user_deleted.json', function(json) {
                    getDeleted = json;

                }).done (function() {
                    chkFlag = 1;

                    if (chkFlag = 1) {
                        $scope.users = getSignedUp;

                        // data : key_as_string, count : doc_count
                        for(var i in $scope.users) {
                            $scope.users[i].doc_count = $scope.users[i].doc_count - getDeleted[i].doc_count; // count
                        }

                        clearInterval(getJSON);
                    }
                });
            });
        }, 1000);
    }
    */

    // about 활성 사용자 지표
    $scope.selectedMinDate = function(minDate) {
        if (minDate == null) {
            $scope.selMinDate = null;
            $scope.selMinDay = null;
        } else {
            $scope.selMinDate = minDate;

            var temp = minDate.toString().split(" ", 3);
            $scope.selMinDay = temp[2];
        }
    }

    $scope.selectedMaxDate = function(maxDate) {
        if (maxDate == null) {
            $scope.selMaxDate = null;
            $scope.selMaxDay = null;
        } else if ($scope.selMinDate != null) {
            $scope.selMaxDate = maxDate;

            var temp = maxDate.toString().split(" ", 3);
            $scope.selMaxDay = temp[2];

            if ($scope.country != "") {
                getActive(2);
            } else if ( $scope.role != "") {
                getActive(1);
            } else {
                getActive(0);
            }
        } else {
            alert("시작날짜를 선택하세요.")
            $scope.selMaxDate = maxDate;
        }
    }

    $scope.minOpen = function($event) {
        $scope.minStatus.opened = true;

        /*
        $(".btn btn-sm btn-info ng-binding").hide();
        var a = $("button").hasClass("btn btn-sm btn-info ng-binding");
        console.log(a);

        var b = $("button").hasClass("btn btn-default");
        console.log(b);

        var c = $("button").hasClass("btn btn-sm btn-success pull-right ng-binding");
        console.log(c);

        var d = $("button").hasClass("btn btn-sm btn-danger ng-binding");
        console.log(d);
        */

    };

    $scope.maxOpen = function($event) {
        $scope.maxStatus.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 0
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate', 'yyyy-MM-dd'];

    $scope.format = $scope.formats[4];

    $scope.minStatus = {
        opened: false
    };

    $scope.maxStatus = {
        opened: false
    };

    $scope.selectedRole = function(role) {
        if (role != '') {
            $scope.setRole = role;
            getActive(1);
        } else {
            getActive(0);
        }
        // Reset, Country
        $scope.setCountry = "";
        $scope.country = "";
    }

    $scope.selectedCountry = function(country) {
        if (country != '') {
            $scope.setCountry = country;
            getActive(2);
        } else {
            getActive(0);
        }
        // Reset, Role
        $scope.setRole = "";
        $scope.role = "";
    }

    function getActive(optionFlag) { // optionFlag (0: Default, 1: Role, 2: Country)
        var dauURL = "data/dau_";
        var mauURL = "data/mau_";
        var wauURL = "data/wau_";

        if (optionFlag == 1 && typeof($scope.setRole) != 'undefined') {
            if ($scope.setRole == "부모") {
                dauURL = dauURL + "parent.json";
                wauURL = wauURL + "parent.json";
                mauURL = mauURL + "parent.json";
            } else if ($scope.setRole == "교사") {
                dauURL = dauURL + "teacher.json";
                wauURL = wauURL + "teacher.json";
                mauURL = mauURL + "teacher.json";
            } else if ($scope.setRole == "학생") {
                dauURL = dauURL + "student.json";
                wauURL = wauURL + "student.json";
                mauURL = mauURL + "student.json";
            }
        } else if (optionFlag == 2 && typeof($scope.setRole) != 'undefined') {
            if ($scope.setCountry == "한국") {
                dauURL = dauURL + "korea.json";
                wauURL = wauURL + "korea.json";
                mauURL = mauURL + "korea.json";
            } else if ($scope.setCountry == "일본") {
                dauURL = dauURL + "japan.json";
                wauURL = wauURL + "japan.json";
                mauURL = mauURL + "japan.json";
            }
        } else {
            dauURL = "data/daily-active-users.json";
            wauURL = "data/weekly-active-users.json";
            mauURL = "data/monthly-active-users.json";
        }

        // getDAU
        $http({
            method: 'get',
            url: dauURL
        }).then(function (response) {

            // Return Data (date : key, count : doc_count)
            $scope.getDAU = response.data;

            // getWAU
            $http({
                method: 'get',
                url: wauURL
            }).then(function (response) {

                // Return Data (date : key, count : doc_count)
                $scope.getWAU = response.data;

                // getMAU
                $http({
                    method: 'get',
                    url: mauURL
                }).then(function (response) {
                    // Return Data (date : key, count : doc_count)
                    $scope.getMAU = response.data;

                    dateIndexInit($scope.getDAU, $scope.getWAU, $scope.getMAU);

                    var btDate = $scope.selMinDate - $scope.minDate;
                    var btDay = parseInt(btDate / (1000*60*60*24) + 1);

                    if ($scope.selMinDate != null && $scope.selMaxDate != null) { // Filter Date
                        var term = $scope.selMaxDay - $scope.selMinDay + 1;

                        $scope.actives = new Array();
                        for (var i=btDay; i<btDay+term; i++) {
                            var keys = new Object();
                            keys.index = i-btDay;
                            keys.key_as_string = $scope.getDAU[$scope.dauMinIndex+i].key.substring(0,4) + '-' +
                                                 $scope.getDAU[$scope.dauMinIndex+i].key.substring(4,6) + '-' +
                                                 $scope.getDAU[$scope.dauMinIndex+i].key.substring(6,8);
                            keys.doc_dau = $scope.getDAU[$scope.dauMinIndex+i].doc_count;
                            keys.doc_wau = $scope.getWAU[$scope.wauMinIndex+i].doc_count;
                            keys.doc_mau = $scope.getMAU[$scope.mauMinIndex+i].doc_count;

                            if ($scope.getDAU[$scope.dauMinIndex+i-7] != null) {
                                keys.doc_bt_dau = $scope.getDAU[$scope.dauMinIndex+i].doc_count - $scope.getDAU[$scope.dauMinIndex+i-7].doc_count;
                            } else {
                                keys.doc_bt_dau = 0;
                            }

                            $scope.actives.push(keys);
                        }
                    } else { // Default
                        var term = $scope.dauMaxIndex - $scope.dauMinIndex + 1;

                        $scope.actives = new Array();
                        for (var i=0; i<term; i++) {
                            var keys = new Object();
                            keys.index = i;
                            keys.key_as_string = $scope.getDAU[$scope.dauMinIndex+i].key.substring(0,4) + '-' +
                                                 $scope.getDAU[$scope.dauMinIndex+i].key.substring(4,6) + '-' +
                                                 $scope.getDAU[$scope.dauMinIndex+i].key.substring(6,8);
                            keys.doc_dau = $scope.getDAU[$scope.dauMinIndex+i].doc_count;
                            keys.doc_wau = $scope.getWAU[$scope.wauMinIndex+i].doc_count;
                            keys.doc_mau = $scope.getMAU[$scope.mauMinIndex+i].doc_count;

                            if ($scope.getDAU[$scope.dauMinIndex+i-7] != null) {
                                keys.doc_bt_dau = $scope.getDAU[$scope.dauMinIndex+i].doc_count - $scope.getDAU[$scope.dauMinIndex+i-7].doc_count;
                            } else {
                                keys.doc_bt_dau = 0;
                            }

                            $scope.actives.push(keys);
                        }
                    }

                    // Max, Min, Avg
                    getMaxMinAvg();

                    // DrawChart
                    chartActive();
                },function (error){
                    console.log(error, 'can not get mau data.');
                });
            },function (error){
                console.log(error, 'can not get wau data.');
            });
        },function (error){
            console.log(error, 'can not get dau data.');
        });
    }

    function getMaxMinAvg() {
        if (parseInt(Object.keys($scope.actives).length) != 0) {
            var min_dau = $scope.actives[0].doc_dau;
            var max_dau = $scope.actives[0].doc_dau;
            var avg_dau = 0;
            var min_wau = $scope.actives[0].doc_wau;
            var max_wau = $scope.actives[0].doc_wau;
            var avg_wau = 0;
            var min_mau = $scope.actives[0].doc_mau;
            var max_mau = $scope.actives[0].doc_mau;
            var avg_mau = 0;

            for (var i in $scope.actives) {
                if (min_dau > $scope.actives[i].doc_dau) min_dau = $scope.actives[i].doc_dau;
                if (min_wau > $scope.actives[i].doc_wau) min_wau = $scope.actives[i].doc_wau;
                if (min_mau > $scope.actives[i].doc_mau) min_mau = $scope.actives[i].doc_mau;

                if (max_dau < $scope.actives[i].doc_dau) max_dau = $scope.actives[i].doc_dau;
                if (max_wau < $scope.actives[i].doc_wau) max_wau = $scope.actives[i].doc_wau;
                if (max_mau < $scope.actives[i].doc_mau) max_mau = $scope.actives[i].doc_mau;

                avg_dau = avg_dau + $scope.actives[i].doc_dau;
                avg_wau = avg_wau + $scope.actives[i].doc_wau;
                avg_mau = avg_mau + $scope.actives[i].doc_mau;
            }

            var length = parseInt(Object.keys($scope.actives).length);

            avg_dau = Math.round(avg_dau / length);
            avg_wau = Math.round(avg_wau / length);
            avg_mau = Math.round(avg_mau / length);

            $scope.detailActive = new Object();
            $scope.detailActive.DAU = new Object();
            $scope.detailActive.DAU.min = min_dau;
            $scope.detailActive.DAU.max = max_dau;
            $scope.detailActive.DAU.avg = avg_dau;
            $scope.detailActive.WAU = new Object();
            $scope.detailActive.WAU.min = min_wau;
            $scope.detailActive.WAU.max = max_wau;
            $scope.detailActive.WAU.avg = avg_wau;
            $scope.detailActive.MAU = new Object();
            $scope.detailActive.MAU.min = min_mau;
            $scope.detailActive.MAU.max = max_mau;
            $scope.detailActive.MAU.avg = avg_mau;
        }
    }

    function chartActive() {
        var chartActive = {
          "type": "bar",
          /*
          "title": {
            "text": "활성 사용자 지표"
          },
          */
          "plot": {
            "value-box": {
              "text": "%v"
            }
          },
          "legend": {
            "toggle-action": "hide",
            "item": {
              "cursor": "pointer"
            },
            "draggable": false,
            "drag-handler": "icon"
          },
          "scale-x": {
            "values": []
          },
          "series": [
            {
                "values": [],
                "text": "DAU",
                "palette": 0
            },
            {
                "values": [],
                "text": "WAU",
                "palette": 1
            },
            {
                "values": [],
                "text": "MAU",
                "palette": 2
            },
          ]
        };

        if ($scope.selMinDay != '' && $scope.selMaxDay != '') { // DateFilter

            for(var i in $scope.actives) {
                // DAU
                chartActive.series[0].values.push($scope.actives[i].doc_dau);
                // WAU
                chartActive.series[1].values.push($scope.actives[i].doc_wau);
                // MAU
                chartActive.series[2].values.push($scope.actives[i].doc_mau);
            }
        }

        zingchart.render({
          id: "chartActive",
          data: chartActive,
          height: "500",
          width: "100%"
        });
    }

    function dateIndexInit(a, b, c) {
        if (typeof(c) == 'undefined') { // SignedUp & Deleted ( Date: key_as_string )
            var signedUp = a;
            var deleted = b;
        } else if (typeof(c) != 'undefined') { // DAU & WAU & MAU ( Date: key )
            var dau = a;
            var wau = b;
            var mau = c;

            var dau_index = parseInt(Object.keys(dau).length);
            var wau_index = parseInt(Object.keys(wau).length);
            var mau_index = parseInt(Object.keys(mau).length);

            // Return Data (minDate, maxDate)
            $scope.minDate = dau[0].key;
            if ($scope.minDate < wau[0].key) $scope.minDate = wau[0].key;
            if ($scope.minDate < mau[0].key) $scope.minDate = mau[0].key;

            $scope.maxDate = dau[dau_index-1].key;
            if ($scope.maxDate > wau[wau_index-1].key) $scope.maxDate = wau[wau_index-1].key;
            if ($scope.maxDate > mau[mau_index-1].key) $scope.maxDate = mau[mau_index-1].key;

            // Return Data (minIndex, maxIndex)
            for(var i=0; i<dau_index; i++) {
                if (dau[i].key == $scope.minDate) $scope.dauMinIndex = i;
                if (dau[i].key == $scope.maxDate) $scope.dauMaxIndex = i;
            }
            for(var i=0; i<wau_index; i++) {
                if (wau[i].key == $scope.minDate) $scope.wauMinIndex = i;
                if (wau[i].key == $scope.maxDate) $scope.wauMaxIndex = i;
            }
            for(var i=0; i<mau_index; i++) {
                if (mau[i].key == $scope.minDate) $scope.mauMinIndex = i;
                if (mau[i].key == $scope.maxDate) $scope.mauMaxIndex = i;
            }

            $scope.minDate = new Date(Date.UTC($scope.minDate.substring(0,4), $scope.minDate.substring(4,6), $scope.minDate.substring(6,8)));
            $scope.maxDate = new Date(Date.UTC($scope.maxDate.substring(0,4), $scope.maxDate.substring(4,6), $scope.maxDate.substring(6,8)));
        }
    }
})