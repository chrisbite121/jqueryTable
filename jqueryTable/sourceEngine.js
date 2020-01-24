

var mYearData = {
    //config version comes from config file
    configVersion: '',
    //app version is set here an 
    appVersion: 2,
    //integrity properties - if false then unable to initialise app
    configIntegrityCheck: true,
    dataIntegrityCheck: true,
    jsonIntegrityCheck: true,
    //data objects built up based on current year cost fields
    rawTimeDataObject: {},
    rawSummaryDataObject: {},
    timeTableDataArray: [],
    summaryTableDataArray: [],
    formatAsCurrency: true,
    //label data - loaded in from central config
    rows: [],
    labels: [],
    keys: [],
    columns: [],
    currencies: [],
    timeFieldIds: [],
    summaryFieldIds: [],
    totalFieldIds: [],
    noColumns: 0,
    cellClass: '',
    //mlts - loaded in from central config
    JsonFieldGuid: [],
    //internal temp
    _tmpField: '',
    _tmpCalc1: '',
    _tmpCalc2: '',
    
    //internal properties used to build up json data
    vars: '',
    hash: '',
    hashes: '',
    selectedYear: '',
    JsonData: '',
    SummaryJsonData: '',
    TimeJsonData: '',
    newDataFlag: false,
    JsonDataString: '',
    encodedStringLength: 0,
    noMltFieldsRequired: 1,
    JsonDataStringArray: [],
    JsonStringCounter: 0,
    JsonStringStartFromValue: 0,
    JsonArrayFragmentCounter: 0,
    debugMode: false,
    selectedFieldId: '',
    selectedYearMltData: '',
    editMode: false,
    startYear: '',
    duration: 1,
    calculations: [],
    EcfWebpartId: '',
    projuid: '',
    start: '',
    finish: '',
    currency: '',

    cellClass: '',
    colSummaryClass: '',
    code: '',
    allowedChars: [8, 9, 37, 38, 39, 40, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110, 190],
    fyOffset:0,
    selectedYearDataSpan: 1,
    selectedField: '',
    showColumnTotals: false,
    columnTotalFunction: '',
    summaryColumns: [],

    versionProperties: {},
    enableLogging: false,
}

//First Add this to extend jQuery
function mGetParams() {
    $.extend({
            getUrlVars: function () {
                //reset varialbes
                mYearData.vars = [];
                mYearData.hash = '';
                mYearData.hashes = '';

                mYearData.hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
                for (var i = 0; i < mYearData.hashes.length; i++) {
                    mYearData.hash = mYearData.hashes[i].split('=');
                    mYearData.vars.push(mYearData.hash[0]);
                    mYearData.vars[mYearData.hash[0]] = mYearData.hash[1];
                }
                return mYearData.vars;
            },
            getUrlVar: function (name) {
                return $.getUrlVars()[name];
            }
        });

    mYearData.projuid = '';
    // Getting URL var by its name
    mYearData.projuid = $.getUrlVar('projuid');
    if (!mYearData.projuid) {
        mYearData.projuid = $.getUrlVar('ProjUid')
    }
    if (mYearData.projuid && mYearData.projuid.length > 0) {
        mGetProjectValues()
    } else {
        console.log('FINANCE APP: could not find project uid parameter ')
    }    
}

function mGetProjectValues() {
    if(_spPageContextInfo.siteAbsoluteUrl && mYearData.projuid) {
        mYearData.lookupApiUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/ProjectServer/Projects('" + mYearData.projuid + "')?$select=StartDate,FinishDate,CurrencySymbol"
        $.ajax({
            url: mYearData.lookupApiUrl,
            method: "GET",
            headers: {
                "Accept": "application/json; odata=verbose"
            },
            success: function (data) {
                if (data && data.d) {
                    mYearData.start = data.d.StartDate
                    mYearData.finish = data.d.FinishDate
                    if(data.d.CurrencySymbol) {
                        mYearData.currency = data.d.CurrencySymbol
                    }
                    mYearData.startYear = new Date(mYearData.start).getUTCFullYear()
                    mYearData.duration = (new Date(mYearData.finish).getUTCFullYear() - mYearData.startYear) + 1
                    mInitApp()
                } else {
                    console.log('FINANCE APP: could not find project details')
                }
            },
            error: function (data) {
                console.log("FINANCE APP: Get Project Information API call failed");
            }
        });
    } else {
        console.log("FINANCE APP: Unable to detertime site url and/or project id");
    }
}
function mInitApp(){
    $(document).ready(function () {
        mSetMltVariable()
        if(mYearData.configIntegrityCheck == false) {
            mLoadConfigFailed()
        } else {
            mInitToolBar()
            mInitCalculationsTable()
            mGetSelectedYearValue()
            mGetMltAppData()
            mExtractJsonData()
            mCreateJsonStructureIfBlank()
            mCheckJsonStructure()
            if(mYearData.jsonIntegrityCheck == false) {
                mHandleJsonDataIntegrityCheckFail()
                mRegisterResetDataFunction()
            } else {
                mUpgradeJsonDataIfRequired()
                mRegisterHandlers()


                mExtractSummaryJsonData()
                mExtractTimeJsonData()
                //TO BE ADDED
                //2. check properties of selected years is correct
                // a. add properties if missing.
                // b. remove properties if don't exist.
                mCheckForMissingTimeProps()
                mRemoveExcessTimeProps()
                
                //set summary rows
                mCheckForMissingSummaryProps()
                mRemoveExcessSummaryProps()

                mSetSelectedSummaryFieldValues()
                mInitSelectedYearProcess()
                mInitChart()
            }
        }
    });
}

function mInitSelectedYearProcess(){
    //Check objects exist for selected years
    //if not add placeholder values
    mCreateMissingYearData()
    //extract selected year data - not needed anymore
    // mGetMltSelectedYearData()
    //set selected year data in table
    mSetSelectedYearFieldValues()
    //apply field formatting
    mUpdateMltData(true)
}

function mUpdateMltData(formatData) {
    
    //Add field values to data.

    //construct time data objects 
    mGetTmeTableFieldData()
    mConstructTimeTableDataObject()

    //construct summary data objects
    mGetSummaryTableFieldData()
    mConstructSummaryDataObject()
    mUpdateTimeJsonData()
    mUpdateSummaryJsonData()
    mUpdateJsonData()


    mCreateJsonString()
    mCheckDataIntegrity()
    if(mYearData.dataIntegrityCheck) {
        mGenerateJsonForMlts()
        mClearEcfMltFields()
        mUpdateEcfMltFields()
        mRunTotalColumnCalculations()
        mRunCalculations()
        if(formatData) {
            mFieldFormating()
        }
    }
}

function mFieldFormating(){
    if(mYearData.formatAsCurrency) {
        mFormatFieldsAsCurrency()
        mNumberFormatErrors()
    }
}

function mSetMltVariable() {
    //based on config version
    mYearData.configVersion = uAppConfigObject.version
    //get major version number to determine how to load config
    switch(Math.floor(+mYearData.configVersion)) {
        case 1:
            mBuildMltVariableVersion1()
        break;
        default:
            mYearData.configIntegrityCheck = false
        break;
    }
}

function mBuildMltVariableVersion1(){

    //load config from central config file
    mYearData.rows = uAppConfigObject.tableConfig.rows;

    for(i=0;i<mYearData.rows.length;i++) {
    //don't want to include header rows in calcuation
    if(!mYearData.rows[i].headerRow) {
        mYearData.keys.push(mYearData.rows[i].key)
        mYearData.labels.push(mYearData.rows[i].label)
        }
    }

    mYearData.columns = uAppConfigObject.tableConfig.columns;
    mYearData.noColumns = uAppConfigObject.tableConfig.columns.length;
    mYearData.summaryColumns = uAppConfigObject.tableConfig.summaryColumns;
    mYearData.showColumnTotals = uAppConfigObject.tableConfig.showColumnTotals;
    mYearData.columnTotalFunction = uAppConfigObject.tableConfig.columnTotalFunction;
    mYearData.totalFieldIds = uAppConfigObject.totalFieldIds;



    mYearData.debugMode = uAppConfigObject.debugMode;
    mYearData.selectedFieldId = uAppConfigObject.selectedYearFieldId;
    mYearData.calculations = uAppConfigObject.calculations;
    mYearData.EcfWebpartId = uAppConfigObject.EcfWebpartId;
    mYearData.formatAsCurrency = uAppConfigObject.formatAsCurrency;
    mYearData.timeFieldIds = uAppConfigObject.timeFieldIds;
    mYearData.summaryFieldIds = uAppConfigObject.summaryFieldIds;
    mYearData.cellClass = uAppConfigObject.tableConfig.cellClass
    mYearData.colSummaryClass = uAppConfigObject.tableConfig.colSummaryClass;
    mYearData.fyOffset = uAppConfigObject.fyOffset

    //determine number of years selectedYearDataSpans
    mYearData.selectedYearDataSpan = 1 + Math.ceil(mYearData.fyOffset / mYearData.columns.length);
    

    //initialise jsondata
    mYearData.TimeJsonData = [];
    mYearData.SummaryJsonData = [];
    mYearData.JsonData = [];

    if($("div[guid='" + mYearData.selectedFieldId + "']").length) {
        mYearData.editMode = false;
    } else if($("input[guid='" + mYearData.selectedFieldId + "']").length) {
        mYearData.editMode = true;
    } else {
        console.log('unable to determine if page is in edit or view mode')
    }

    //validate mltguids exist and add them to jsonfieldguid array
    mYearData.JsonFieldGuid = []
    for(var i=0;i<uAppConfigObject.mltGuids.length;i++) {
        if(mYearData.editMode) {
            if($("textarea[guid='"+uAppConfigObject.mltGuids[i]).length) {
                mYearData.JsonFieldGuid.push(uAppConfigObject.mltGuids[i]);
            }
        } else {
            if($("div[guid='"+uAppConfigObject.mltGuids[i]).length) {
                mYearData.JsonFieldGuid.push(uAppConfigObject.mltGuids[i]);
            }
        }
    }
    mYearData.enableLogging = uAppConfigObject.enableLogging

    //set json data version properties
    mYearData.versionProperties["1"] = []
    mYearData.versionProperties["2"] = ["v", "timephased", "summary"]

    mYearData.jsonIntegrityCheck = true;
    mYearData.configIntegrityCheck = true;
    mYearData.dataIntegrityCheck = true;
}

function mLoadConfigFailed(){
    $('#faToolBar').remove();
    $('#financeAppContainer').prepend('<div id="faToolBar"></div>')
    $('#faToolBar').append('<div id="faToolbar_errorMessage">Config Load - Failed unable to initialise App, please contact a System Administrator</div>')
}

function mInitToolBar() {
    //remove element in case alreay there
    $('#faToolBar').remove();
    //now add toolbar
    $('#financeAppContainer').prepend('<div id="faToolBar"></div>')
    if(mYearData.editMode) {
        $('#faToolBar').append('<select id="_mltDropDown"></select>')
        if(mYearData.debugMode) {
            $('#faToolBar').append('<button id="_mltDelete">'+ "wipe data" +'</button>')
            $('#faToolBar').append('<button id="_mltRandomData">'+ "Generate Random Data" +'</button>')
        }

        //populate year drop down
        for(var i=0;i<mYearData.duration;i++) {
            $('#_mltDropDown').append('<option value="' + (mYearData.startYear + i).toString() + '">' + (mYearData.startYear + i).toString() +'</option>')
        }
    } else {
        $('#faToolBar').append('<div id="_mltDropDown">' + mYearData.selectedYear + '</div>')
    }

    $('#faToolBar').append('<div id="faToolbar_notification"></div>')

}

function mInitCalculationsTable() {
    $("#faSummaryCalculations").remove();
    $("#financeAppContainer").append('<div id="faSummaryCalculations"></div>')
    for(var p=0;p<mYearData.calculations.length; p++) {
        $("#faSummaryCalculations").append('<div id="faCalculationField' + p + '"></div>')
        $("#faCalculationField" + p).append('<div class="faCalcFieldLabel" id="faCalFieldLabel_' + mYearData.calculations[p].key + '">' + mYearData.calculations[p].label + ':</div>')
        $("#faCalculationField" + p).append('<div class="faCalcFieldValue" id="' + mYearData.calculations[p].fieldId + '"></div>')

        if(mYearData.calculations[p].hasOwnProperty("labelWidth")) {
            $("#faCalFieldLabel_"+ mYearData.calculations[p].key).css("min-width",mYearData.calculations[p].labelWidth)
        }
    }
}

function mGetSelectedYearValue(){
    mYearData._tmpField = '';

    //check if field is on the page
    if($("div[guid='" + mYearData.selectedFieldId + "']").length
        || $("input[guid='" + mYearData.selectedFieldId + "']").length) {

        //load field value into _tmp variable
        mYearData._tmpField = 
        $("input[guid='" + mYearData.selectedFieldId + "']").val() 
        || $("div[guid='" + mYearData.selectedFieldId + "']").text();

        //check if selected
        if(!(mYearData._tmpField.length > 0)) {
            //what if date format is FY
            mYearData.selectedYear = (new Date()).getFullYear().toString()
            //selected year field appears to be blank so set it to current year
            //if in edit mode
            if($("input[guid='" + mYearData.selectedFieldId + "']").length) {
                $("input[guid='" + mYearData.selectedFieldId + "']").val(mYearData.selectedYear)
            }
        } else {
            //year value found set local variable
            mYearData.selectedYear = mYearData._tmpField.toString()
        }

        //reset _tmpField
        mYearData._tmpField = ''

        //we also now need to update dropdown
        //check if option exsists in drop down
        if ($("#_mltDropDown option[value='" + mYearData.selectedYear + "']").length > 0) {
            $("#_mltDropDown").val(mYearData.selectedYear)
        } else {
            //add year option to dropdown if doesn't exist
            $("#_mltDropDown").append('<option value="' + mYearData.selectedYear +'">' + mYearData.selectedYear +'</option>');
            $("#_mltDropDown").val(mYearData.selectedYear)
        }

    } else {
        console.log('ERROR: unable to locate selected year field')
    }
}

function mGetMltAppData() {
    //do we need to get config data as well such as keys
    //this will make the solution more dynamic

    //reset JsonDataString
    mYearData.JsonDataString = '';

    //check for mlt data first
    if(mYearData.editMode) {
        for(var i=0;i<mYearData.JsonFieldGuid.length;i++) {
            if($("textarea[guid='" + mYearData.JsonFieldGuid[i] + "']").parent().find("div").text()
                && $("textarea[guid='" + mYearData.JsonFieldGuid[i] + "']").parent().find("div").text().length > 1
                ) {
                    mYearData.JsonDataString = mYearData.JsonDataString.concat($("textarea[guid='" + mYearData.JsonFieldGuid[i] + "']").parent().find("div").text().trim())
            }
        }
    } else {
        for(var i=0;i<mYearData.JsonFieldGuid.length;i++) {
            if($("div[guid='" + mYearData.JsonFieldGuid[i] + "']").text()
                && $("div[guid='" + mYearData.JsonFieldGuid[i] + "']").text().length > 1
                ) {
                    mYearData.JsonDataString = mYearData.JsonDataString.concat($("div[guid='" + mYearData.JsonFieldGuid[i] + "']").text().trim())
            }
        }
        
    }
}

function mExtractJsonData() {
    if(mYearData.JsonDataString 
        && typeof(mYearData.JsonDataString)=='string' 
    ){
        try {
            mYearData.JsonData = JSON.parse(mYearData.JsonDataString)
        } catch(e) {
            mYearData.jsonIntegrityCheck = false
        }
        
    }
}

function mCheckJsonStructure(){
    //firstly check if version property exists
    if(!mYearData.JsonData.hasOwnProperty("v")) {
        mYearData.jsonIntegrityCheck = false
    }

    //are all top level properties present
    switch(mYearData.JsonData.v) {
        case 1:

        break;
        case 2:
            for(var k=0; k < mYearData.versionProperties["2"].length;k++) {
                //check json data has all of the required properties
                if(!mYearData.JsonData.hasOwnProperty(mYearData.versionProperties["2"][k])) {
                      mYearData.jsonIntegrityCheck = false
                }
            }
        break;
        default:
            mYearData.jsonIntegrityCheck = false
        break;
    }
}

function mHandleJsonDataIntegrityCheckFail(){
    $('#faToolbar_notification').empty()
    if(mYearData.editMode) {
        $('#faToolbar_notification').append('<div id="faToolbar_errorMessage">Data integrity check failed unable to initialise App, please either Reset Data or contact an administrator</div><button id="_mltReset">Reset App Data</button>')
    } else {
        $('#faToolbar_notification').append('<div id="faToolbar_errorMessage">Data integrity check failed unable to initialise App, please either Reset Data or contact an administrator - to Reset application data put PDP into Edit Mode')
    }
    
    
    //hide other buttons in toolbar as these do not work
    $("#_mltDropDown").hide()
    $("#_mltDelete").hide()
    $("#_mltRandomData").hide()
}

function mCreateJsonStructureIfBlank(){
    if(typeof(mYearData.JsonDataString) == 'string' &&
        mYearData.JsonDataString.length == 0) {
        console.log('No Json Data found - Initialising app data')
        mYearData.JsonData = {
            v: mYearData.appVersion,
            summary: [],
            timephased: []
        }
    }
}

function mExtractTimeJsonData() {
    if(mYearData.JsonData) {
        mYearData.TimeJsonData = mYearData.JsonData.timephased
    }
}

function mExtractSummaryJsonData(){
    if(mYearData.JsonData) {
        mYearData.SummaryJsonData = mYearData.JsonData.summary
    }
}

function mUpgradeJsonDataIfRequired() {
    if(mYearData.JsonData.v !== mYearData.appVersion) {
        console.log('versions do not match')
    }
}


function mCheckForMissingTimeProps() {
    //iterate through json data and add any properties that are in the config but not the json data
    //this could happen in the scenario that the config for the app is changed
    for(var i=0; i<mYearData.TimeJsonData.length; i++) {
        for(var m=0;m<mYearData.columns.length;m++) {
            mYearData._tmpField = false
            //iterate through each columns in the json and check it exists
            for(var j=0; j<mYearData.TimeJsonData[i].d.length; j++) {
                if(mYearData.TimeJsonData[i].d[j].m == mYearData.columns[m].key) {
                    //now check properties exist
                    //iterate through the properties of that columns
                    for(var n=0;n<mYearData.keys.length;n++) {
                        //if key doesn't exist initialise with 0
                        if(!(mYearData.TimeJsonData[i].d[j].hasOwnProperty(mYearData.keys[n]))) {
                            mAddLog('key ' + mYearData.keys[n] + ' does not exist on column ' + mYearData.TimeJsonData[i].d[j].m + ', creating entry')
                            mYearData.TimeJsonData[i].d[j][mYearData.keys[n]] = 0
                        }
                    }
                    mYearData._tmpField = true
                }
            }
            //if columns doesn't exist create it
            if(!mYearData._tmpField) {
                mAddLog('column: ' + mYearData.columns[m].key + ' defined in config does not exist in JSON, creating entry..')

                //add column entry
                mYearData.TimeJsonData[i].d.push({
                    m : mYearData.columns[m].key
                })

                //add properties to column entry
                for(var n=0;n<mYearData.keys.length;n++) {
                    //add to last entry in array
                    //initialise key with 0
                    mYearData.TimeJsonData[i].d[mYearData.TimeJsonData[i].d.length - 1][mYearData.keys[n]] = 0
                }
            }
        }
    }
}

function mRemoveExcessTimeProps() {
    //iterate through json data and delete any properties from the json data that aren't in the config
    //this could happen in the scenario that the config for the app is changed
    for(var i=0; i<mYearData.TimeJsonData.length; i++) {
        for(var j=0; j<mYearData.TimeJsonData[i].d.length; j++) {
            //iterate through the columns delete if m property is not recognised
            if(!(mLookupColPostion(mYearData.TimeJsonData[i].d[j].m) >= 0)) {
                mAddLog('column found in json data that does not match config - deleting entry', mYearData.TimeJsonData[i].d[j].m)
                mYearData.TimeJsonData[i].d.splice(j,1)
            } else {
                //else iterate through keys and remove any properties that aren't in the config
                for(var k in mYearData.TimeJsonData[i].d[j])  {
                    if(mYearData.TimeJsonData[i].d[j].hasOwnProperty(k) &&
                        k !== 'm'
                    ) {
                        //check property is in the config 
                        if(mYearData.keys.indexOf(k) == -1) {
                            mAddLog('element, ' + k + ' of column ' + mYearData.TimeJsonData[i].d[j].m + ' for year ' + mYearData.TimeJsonData[i].y + ' not found in config - deleting entry')
                            //if not delete
                            delete mYearData.TimeJsonData[i].d[j][k]
                        }  
                    }
                }              
            }
        }
    }
}

function mCheckForMissingSummaryProps() {
    //check for labels
    for(var k=0;k<mYearData.summaryColumns.length; k++) {
        mYearData._tmpCalc1 = false
        for(var i=0; i<mYearData.SummaryJsonData.length; i++) {

            if(mYearData.SummaryJsonData[i].m == mYearData.summaryColumns[k].key) {
                mYearData._tmpCalc1 = true

                //now check each property exists
                for(var j=0;j<mYearData.keys.length;j++) {
                    if(!mYearData.SummaryJsonData[i].hasOwnProperty(mYearData.keys[j])) {
                        //if property doesn't exist initialise with empty string
                        mYearData.SummaryJsonData[i][mYearData.keys[j]] = ""
                    }
                }
            }
        }
        //if summary column object not found add it to summary json data
        if(mYearData._tmpCalc1 == false) {
            mAddLog('creating summary data')
            //need to create summary props
            mYearData.SummaryJsonData.push({ m: mYearData.summaryColumns[k].key })
            for(var j=0; j<mYearData.rows.length; j++) {
                if(!mYearData.rows[j].headerRow) {
                    mAddLog('adding property')
                    mYearData.SummaryJsonData[mYearData.SummaryJsonData.length-1][mYearData.rows[j].key] = ""
                }
            }
        }
        
    }

}

function mRemoveExcessSummaryProps() {
    for(var i=0; i<mYearData.SummaryJsonData.length; i++) {
        if(mYearData.SummaryJsonData[i].m !== "labels" &&
            !(mLookupSummaryColPostion(mYearData.SummaryJsonData[i].m) >= 0)) {
                mAddLog('summary column found in json data that does not match config - deleting entry', mYearData.SummaryJsonData[i].m)
            mYearData.SummaryJsonData.splice(i,1)
        } else {
            //else iterate through keys and remove any properties that aren't in the config
            for(var k in mYearData.SummaryJsonData[i])  {
                if(mYearData.SummaryJsonData[i].hasOwnProperty(k) &&
                    k !== 'm'
                ) {
                    //check property is in the config 
                    if(mYearData.keys.indexOf(k) == -1) {
                        mAddLog('element, ' + k + ' of column ' + mYearData.SummaryJsonData[i].m + ' not found in config - deleting entry')
                        //if not delete
                        delete mYearData.SummaryJsonData[i][k]
                    }
                }
            }
        }
    }
}


function mSetSelectedSummaryFieldValues(){
    //data for selected year exists set fields to these values
    for(var i=0; i<mYearData.summaryFieldIds.length; i++) {
        mYearData._tmpField = "";
        //row reference and col ref can be pulled from the field ids
        mYearData._tmpField = mLookupSummaryFieldValueInJson(
            (mYearData.summaryFieldIds[i]).split('_')[2], 
            (mYearData.summaryFieldIds[i]).split('_')[1]
        )
        if(mYearData.editMode) {
            $("#" + mYearData.summaryFieldIds[i]).val(mYearData._tmpField)
        } else {
            $("#" + mYearData.summaryFieldIds[i]).text(mYearData._tmpField)
        }        
    }
}

function mCreateMissingYearData() {
    for(var n=0; n<mYearData.selectedYearDataSpan;n++) {
        mYearData._tmpField = false
            for(var m=0; m<mYearData.TimeJsonData.length;m++) {
                if(mYearData.TimeJsonData[m].y == (+mYearData.selectedYear + n).toString()) {
                    mYearData._tmpField = true
                }
            }

        if(mYearData._tmpField == false) {
            mCreateJsonDataEntry(
                (+mYearData.selectedYear + n).toString(),
                mCreatePlaceholderYearData()
            )
        }
    }
}

function mSetSelectedYearFieldValues() {
    //data for selected year exists set fields to these values
    for(var i=0; i<mYearData.timeFieldIds.length; i++) {
        mYearData._tmpField = "";

        //row reference and col ref can be pulled from the field ids
        mYearData._tmpField = mLookupTimeFieldValueInJson(
            (mYearData.timeFieldIds[i]).split('_')[2], 
            (mYearData.timeFieldIds[i]).split('_')[1],
            mLookupColPostion((mYearData.timeFieldIds[i]).split('_')[1])
        )

        if(mYearData.editMode) {
            $("#" + mYearData.timeFieldIds[i]).val(mYearData._tmpField)
        } else {
            $("#" + mYearData.timeFieldIds[i]).text(mYearData._tmpField)
        }
    }
}






function mGetTmeTableFieldData() {
    //start to build up first data object
    mYearData.rawTimeDataObject = {}

    for(var j=0; j<mYearData.labels.length;j++) {
        mYearData.rawTimeDataObject[mYearData.keys[j]] = {}
        mYearData.rawTimeDataObject[mYearData.keys[j]].category = mYearData.labels[j];
    }

    for(var i=0; i<mYearData.timeFieldIds.length; i++) {
        //load field value into _tmp variable
        mYearData._tmpField = 
        $("#" + mYearData.timeFieldIds[i]).val()
        || $("#" + mYearData.timeFieldIds[i]).text();

        
        if(mYearData._tmpField) {
            //REFACTOR INTO SEPERATE FUNCTION
            //convert to number and trim currency symbol if there is one
            // if(mYearData.currencies.indexOf((mYearData._tmpField.substr(0,1))) !== -1) {
            if(isNaN(mYearData._tmpField.substr(0,1))) {
                mYearData._tmpField = +(mYearData._tmpField.substr(1))
            } else {
                mYearData._tmpField = +(mYearData._tmpField)
            }

            //place into object using key and columns properties
            mYearData.rawTimeDataObject[mYearData.keys[Math.floor(i/mYearData.noColumns)]][mYearData.columns[i%mYearData.noColumns].key] = mYearData._tmpField
        }
    }
}

function mConstructTimeTableDataObject() {
    //reset raw data array
    mYearData.rawDataArray = [];

    //generate raw data array
    Object.getOwnPropertyNames(mYearData.rawTimeDataObject).map(function(value) {
        mYearData.rawDataArray.push(
            mYearData.rawTimeDataObject[value]
        )
    })

    //reset formatted data array
    mYearData.timeTableDataArray = []

    //generate formatted data array
    //re-cast data in form of an array of objects containing the columns value and each cost metric
    for(m=0;m<mYearData.columns.length;m++) {
        //iterate through each columns
        mYearData.timeTableDataArray.push({
            m: mYearData.columns[m].key,
        })
        //iterate through the properties of that columns
        for(n=0;n<mYearData.keys.length;n++) {
            //add to last object in array which is the most recently added object
            mYearData.timeTableDataArray[mYearData.timeTableDataArray.length-1][mYearData.keys[n]] = 
                mYearData.rawTimeDataObject[mYearData.keys[n]][mYearData.columns[m].key]
        }

    }
}

function mGetSummaryTableFieldData(){
    //start to build up first data object
    mYearData.rawSummaryDataObject = {}

    for(var j=0; j<mYearData.labels.length;j++) {
        mYearData.rawSummaryDataObject[mYearData.keys[j]] = {}
        mYearData.rawSummaryDataObject[mYearData.keys[j]].category = mYearData.labels[j];
    }

    for(var i=0; i<mYearData.summaryFieldIds.length; i++) {
        //load field value into _tmp variable
        if(mYearData.summaryColumns[i%mYearData.summaryColumns.length].type=="text") {
            mYearData._tmpField = $("#" + mYearData.summaryFieldIds[i]).text()
                || $("#" + mYearData.summaryFieldIds[i]).val();
        }

        if(mYearData.summaryColumns[i%mYearData.summaryColumns.length].type=="lookup" || mYearData.summaryColumns[i%mYearData.summaryColumns.length].type=="dropdown") {
            mYearData._tmpField = 
                $("#" + mYearData.summaryFieldIds[i] + " option:selected").text()
                || $("#" + mYearData.summaryFieldIds[i]).val();
        }

        if(mYearData._tmpField) {
            mYearData.rawSummaryDataObject[mYearData.keys[Math.floor(i/mYearData.summaryColumns.length)]][mYearData.summaryColumns[i%mYearData.summaryColumns.length].key] = mYearData._tmpField
        }
    }

}

function mConstructSummaryDataObject(){

    //reset formatted data array
    mYearData.summaryTableDataArray = []

    //generate formatted data array
    //re-cast data in form of an array of objects containing the columns value and each cost metric
    for(m=0;m<mYearData.summaryColumns.length;m++) {
        //iterate through each columns
        mYearData.summaryTableDataArray.push({
            m: mYearData.summaryColumns[m].key,
        })
        //iterate through the properties of that columns
        for(n=0;n<mYearData.keys.length;n++) {
            //add to last object in array which is the most recently added object
            mYearData.summaryTableDataArray[mYearData.summaryTableDataArray.length-1][mYearData.keys[n]] = 
            //if undefined put in null
                mYearData.rawSummaryDataObject[mYearData.keys[n]][mYearData.summaryColumns[m].key] || null
        }

    }

    //add row labels
    mYearData.summaryTableDataArray.push({ m:"labels"})
    for(var j=0; j<mYearData.rows.length; j++) {
        if(!mYearData.rows[j].headerRow) {
            mYearData.summaryTableDataArray[mYearData.summaryTableDataArray.length-1][mYearData.rows[j].key] = mYearData.rows[j].label
        }
    }
}

//called when inputting data or wiping data
function mUpdateTimeJsonData() {
    mYearData._tmpField = ''
    for(var i=0; i<mYearData.timeFieldIds.length; i++) {
        //load field value into _tmp variable
        mYearData._tmpField = 
        $("#" + mYearData.timeFieldIds[i]).val()
        || $("#" + mYearData.timeFieldIds[i]).text();

        mYearData._tmpField = mFormatFieldAsNumber(mYearData._tmpField)
        //row reference and col ref can be pulled from the field ids
        mTimeUpdateFieldValueInJson(
                    (mYearData.timeFieldIds[i]).split('_')[2], 
                    (mYearData.timeFieldIds[i]).split('_')[1], 
                    mLookupColPostion((mYearData.timeFieldIds[i]).split('_')[1]), 
                    mYearData._tmpField
        )
    }
}

//called when inputting data or wiping data
function mUpdateSummaryJsonData() {
    mYearData.SummaryJsonData = mYearData.summaryTableDataArray

}

function mUpdateJsonData(){
    mYearData.JsonData.timephased = mYearData.TimeJsonData;
    mYearData.JsonData.summary = mYearData.SummaryJsonData;
}

function mCreateJsonString() {
    //update json string
    mYearData.JsonDataString = JSON.stringify(mYearData.JsonData, null, 0)
}


function mCheckDataIntegrity(){
    //reset data integrity check flag
    mYearData.dataIntegrityCheck = true

    //each instance of " gets encoded into &quot;.  the maximum length allowed in a single MLT is 4000
    mYearData.encodedStringLength = mYearData.JsonDataString.length + ((mYearData.JsonDataString.match(/"/g) || []).length * 5)

    //determine number of MLTs required
    mYearData.noMltFieldsRequired = Math.ceil(mYearData.encodedStringLength / 3900)
    $('#faToolbar_notification').empty()
    if(mYearData.noMltFieldsRequired > mYearData.JsonFieldGuid.length) {
        $('#faToolbar_notification').empty()
        $('#faToolbar_notification').append('<div id="faToolbar_errorMessage">Maximum data capacity reached! unable to save this change to the system. Please contact your System Administrator</div>')
        mYearData.dataIntegrityCheck = false
    }
}

function mGenerateJsonForMlts(){
    //break up string into fragments of 3900 
    //" character is encoded into &quot; so counts as 6 characters
    //reset values
    mYearData.JsonDataStringArray = []
    mYearData.JsonStringCounter = 0
    mYearData.JsonStringStartFromValue = 0
    mYearData.JsonArrayFragmentCounter = 0
    for(i=0;i<mYearData.JsonDataString.length;i++) {
        if(i == (mYearData.JsonDataString.length - 1)) {
                mYearData.JsonDataStringArray.push(
                    mYearData.JsonDataString.substring(mYearData.JsonStringStartFromValue)
                )
        }

        if(mYearData.JsonDataString[i] !== '"') {
            mYearData.JsonStringCounter++
        }

        if(mYearData.JsonDataString[i] == '"') {
            mYearData.JsonStringCounter += 6
        }
        
        if(Math.floor(mYearData.JsonStringCounter / 3900) > mYearData.JsonArrayFragmentCounter &&
        i !== (mYearData.JsonDataString.length - 1)) {
            mYearData.JsonDataStringArray.push(
                    mYearData.JsonDataString.substring(mYearData.JsonStringStartFromValue, i)
                )
                mYearData.JsonStringStartFromValue = i
                mYearData.JsonArrayFragmentCounter++
        }
    }
}

function mClearEcfMltFields(){
    if(mYearData.editMode) {
        for(var i=0;i<mYearData.JsonFieldGuid.length;i++) {
            $("textarea[guid='" + mYearData.JsonFieldGuid[i] + "']").parent().find("div").text('')
        }
    }
}

function mUpdateEcfMltFields(){
    for(var i=0;i<mYearData.JsonDataStringArray.length;i++) {
        // $("textarea[guid='" + mYearData.JsonFieldGuid[i] + "']").parent().find("div").trigger( "click" );
        $("textarea[guid='" + mYearData.JsonFieldGuid[i] + "']").parent().find("div").text(mYearData.JsonDataStringArray[i])
        // $("textarea[guid='" + mYearData.JsonFieldGuid[i] + "']").parent().find("div").trigger( "keydown" );
        mUpdateWpStatus()
    }
}

function mRunTotalColumnCalculations(){
    for(var i=0;i<mYearData.totalFieldIds.length; i++) {
        mYearData._tmpCalc1 = '';
        mYearData._tmpField = '';

        mYearData._tmpField = (mYearData.totalFieldIds[i]).split('_')[2]
        if(mYearData._tmpField) {
            switch(mYearData.columnTotalFunction) {
                case 'YtdTotal':
                    mYearData._tmpCalc1 = mYtdTotalCalcuation(mYearData._tmpField)
                break;
                case 'SumTotal':
                    mYearData._tmpCalc1 = mSumTotalCalcuation(mYearData._tmpField)
                break;        
            }

            if(mYearData.formatAsCurrency){
                $("#" + mYearData.totalFieldIds[i]).text(mYearData.currency + mNumberWithCommas((+(mYearData._tmpCalc1)).toFixed(2)))
            } else {
                $("#" +mYearData.totalFieldIds[i]).text(mYearData._tmpCalc1)
            }
        }
    }
}

function mRunCalculations() {
    for(var j=0; j<mYearData.calculations.length; j++) {
        mYearData._tmpCalc1 = '';
        switch(mYearData.calculations[j].function) {
            case 'YtdTotal':
                mYearData._tmpCalc1 = mYtdTotalCalcuation(mYearData.calculations[j].key)
            break;
            case 'SumTotal':
                mYearData._tmpCalc1 = mSumTotalCalcuation(mYearData.calculations[j].key)
            break;
            case 'SumVariance':
                mYearData._tmpCalc1 = mSumTotalVarianceCalculation(mYearData.calculations[j].key)
            break;
            case 'SumVariance2':
                mYearData._tmpCalc1 = mSumTotalVariance2Calculation(mYearData.calculations[j].key)
            break;
        }
        
        //write to field Id if property has been specified
        if(mYearData.editMode && mYearData.calculations[j].hasOwnProperty('fieldId')) {
            $("input[guid='" + mYearData.calculations[j].fieldId + "']").val(mYearData._tmpCalc1)
        }

        if(mYearData.formatAsCurrency){
            $("#" + mYearData.calculations[j].fieldId).text(mYearData.currency + mNumberWithCommas((+(mYearData._tmpCalc1)).toFixed(2)))
        } else {
            $("#" + mYearData.calculations[j].fieldId).text(mYearData._tmpCalc1)
        }
    }
}

function mFormatFieldsAsCurrency(){
    if(mYearData.currency) {
        for(var i=0; i<mYearData.timeFieldIds.length; i++) {
            //reset value
            mYearData._tmpField = ''
            if(mYearData.editMode) {
                mYearData._tmpField = $("#" + mYearData.timeFieldIds[i]).val();
                //add currency field if not already there
                if(mYearData._tmpField.substr(0,1) !== mYearData.currency) {
                    $("#" + mYearData.timeFieldIds[i]).val(mYearData.currency + (+(mYearData._tmpField)).toFixed(2))
                }
            } else {
                mYearData._tmpField = $("#" + mYearData.timeFieldIds[i]).text();
                //add currency field if not already there
                if(mYearData._tmpField.substr(0,1) != mYearData.currency) {
                    // mYearData._tmpField = $("#" + mYearData.timeFieldIds[i]).text(mYearData.currency + (+(mYearData._tmpField)).toFixed(2));
                    $("#" + mYearData.timeFieldIds[i]).text(mYearData.currency + (+(mYearData._tmpField)).toFixed(2));
                }
            }
        }
    } else {
        console.log('error: unable to format values as currency.  Cannot determine currency value')
    }
}

function mNumberFormatErrors(){
    for(var i=0; i<mYearData.timeFieldIds.length; i++) {
        //reset value
        if(mYearData.editMode) {
            mYearData._tmpField = $("#" + mYearData.timeFieldIds[i]).val();
            //add currency field if not already there
            if(isNaN(+(mYearData._tmpField.substr(1)))) {
                $("#" + mYearData.timeFieldIds[i]).css('border-color', 'red');
                $("#" + mYearData.timeFieldIds[i]).css('border-width', 'medium');
            } else {
                $("#" + mYearData.timeFieldIds[i]).css('border-color', '');
                $("#" + mYearData.timeFieldIds[i]).css('border-width', '');
            }
        }
    }
}

function setSelectedYearValue(year){
    mYearData.selectedYear = year;
    $("input[guid='" + mYearData.selectedFieldId + "']").val(mYearData.selectedYear)
    mUpdateWpStatus()
}

function mRegisterHandlers() {
        $("#_mltDropDown").on('change', function(e) {
            setSelectedYearValue(e.target.value)
            mInitSelectedYearProcess()
            //check if chart has been implemented
            if(typeof cGetData != 'undefined') {
                //update the chart
                cGetData(false)
            }
        });

        if(mYearData.debugMode) {
            $("#_mltDelete").on("click", function(e) {
                e.preventDefault();
                mResetApplication()
            })
        };

        if(mYearData.debugMode) {
            $("#_mltRandomData").on("click", function(e) {
                if(confirm("Warning this will overwrite any existing data for the current year.  Do you wish to continue?")) {
                    e.preventDefault();
                    mSetRandomDataForSelectedYearFieldValues()
                    mUpdateMltData(true)
                    //check if chart has been implemented
                    if(typeof cGetData != 'undefined') {
                        //update the chart
                        cGetData(false)
                    }                    
                }
            })
        }

        $("."+ mYearData.cellClass).keyup(function() {
            if(typeof mUpdateMltData != 'undefined') {
                mUpdateMltData(false)
            } else {
                console.log("unable to call set new year value")
            }
        });
    
        // want value inside cell to be selected when clicked
        $("."+ mYearData.cellClass).click(function() {
            $(this).select(); 
        });

        $("."+ mYearData.cellClass).on('keydown', function(e) {
            mYearData.code = (e.which) ? e.which : e.keyCode;
            if (mYearData.allowedChars.indexOf(mYearData.code) == -1) {
                e.preventDefault();
            }
            //apply arrow navigation
            if([37,38,39,40].indexOf(mYearData.code) !== -1) {
                mYearData.selectedField = mYearData.timeFieldIds.indexOf($(this).attr('id'))
                switch(mYearData.code) {
                    case 38:
                        //up arrow
                        mYearData.selectedField = mYearData.selectedField - mYearData.noColumns
                    break;
                    case 40:
                        //down arrow
                        mYearData.selectedField = mYearData.selectedField + mYearData.noColumns
                    break;
                    case 39:
                        //right arrow
                        mYearData.selectedField = mYearData.selectedField + 1
                    break;
                    case 37:
                        //left arrow
                        mYearData.selectedField = mYearData.selectedField - 1
                    break
                }
                $('#'+mYearData.timeFieldIds[mYearData.selectedField]).focus()
                setTimeout(function(e){
                    $('#'+mYearData.timeFieldIds[mYearData.selectedField]).select()
                },100)
            }
        });

        $("." + mYearData.colSummaryClass).on('change', function(e) {
            mUpdateMltData(false)
        });

        $("." + mYearData.colSummaryClass).on('keyup', function(e) {
            mUpdateMltData(false)
        });

        $('#faTable').on("focusout", function(e) {
            mFieldFormating()
        });

       

    // });
}

function mRegisterResetDataFunction(){
    $("#_mltReset").on("click", function(e) {
        if(confirm("Warning any user data will be lost. Are you sure you wish to continue?")) {
            e.preventDefault();
            mResetApplication()
        }
    });
}

function mResetApplication(){
    //wipe cached data
    mYearData.JsonData = '';
    mYearData.SummaryJsonData = '';
    mYearData.TimeJsonData = '';
    // recreate blank json structure
    mCreateJsonStructureIfBlank()
    //clear mlt values
    mClearEcfMltFields();
    //init process
    mInitApp();
}

function mSetRandomDataForSelectedYearFieldValues() {
    //data for selected year exists set fields to these values
    for(var i=0; i<mYearData.timeFieldIds.length; i++) {
        mYearData._tmpField = 200 + (Math.round(Math.random() * 1700));

        if(mYearData.editMode) {
            $("#" + mYearData.timeFieldIds[i]).val(mYearData._tmpField)
        }
    }
}

function mLookupSummaryFieldValueInJson(rowRef, colRef) {
    if(rowRef != null && colRef != null && Array.isArray(mYearData.TimeJsonData)) {
        for(var j=0; j<mYearData.SummaryJsonData.length; j++) {
            if(mYearData.SummaryJsonData[j].m == colRef) {
                if(mYearData.SummaryJsonData[j].hasOwnProperty(rowRef)) {
                   return mYearData.SummaryJsonData[j][rowRef] 
                }
            }
        }
    }
    console.log('unable to locate summary field value at: ', rowRef, colRef)
}

function mLookupTimeFieldValueInJson(rowRef, colRef, colPosition){
    //current year data could contain more than 1 year if financial year
    if(rowRef != null && colRef != null && Array.isArray(mYearData.TimeJsonData)) {
        for(var j=0; j<mYearData.TimeJsonData.length; j++) {
            //check if column should be looked up from current year
            if(+mYearData.selectedYear + (Math.floor((mYearData.fyOffset + colPosition)/mYearData.noColumns)) == +(mYearData.TimeJsonData[j].y)) {
                //and column matches colref            
                for(var i=0; i<mYearData.TimeJsonData[j].d.length; i++) {
                    //need to check if column is in right year 
                    if(mYearData.TimeJsonData[j].d[i].m == colRef) {
                        //column found now check if row property exists
                        if(mYearData.TimeJsonData[j].d[i].hasOwnProperty(rowRef)
                            && mYearData.TimeJsonData[j].d[i][rowRef] != null) {
                                //return this value as field value
                                return mYearData.TimeJsonData[j].d[i][rowRef]
                        }
                    }
                }
            }
        }
    }
    console.log('unable to locate field value at: ', rowRef, colRef)
}

function mTimeUpdateFieldValueInJson(rowRef, colRef, colPosition, value){
    //current year data could contain more than 1 year if financial year
    if(rowRef != null && colRef != null && Array.isArray(mYearData.TimeJsonData)) {
        for(var j=0; j<mYearData.TimeJsonData.length; j++) {
            //check if column should be looked up from current year
            if(+mYearData.selectedYear + (Math.floor((mYearData.fyOffset + colPosition)/mYearData.noColumns)) == +(mYearData.TimeJsonData[j].y)) {
                //and column matches colref            
                for(var i=0; i<mYearData.TimeJsonData[j].d.length; i++) {
                    //need to check if column is in right year 
                    if(mYearData.TimeJsonData[j].d[i].m == colRef) {
                        //column found now check if row property exists
                        if(mYearData.TimeJsonData[j].d[i].hasOwnProperty(rowRef)) {
                            //return this value as field value
                            mYearData.TimeJsonData[j].d[i][rowRef] = value
                            return
                        }
                    }
                }
            }
        }
    }
    console.log('error setting json data', rowRef, colRef)
}

function mFormatFieldAsNumber(value) {
    if(value) {
            //REFACTOR INTO SEPERATE FUNCTION
            //convert to number and trim currency symbol if there is one
            // if(mYearData.currencies.indexOf((value.substr(0,1))) !== -1) {
            if(isNaN(value.substr(0,1))) {
                return +(value.substr(1))
            } else {
                return +(value)
            }
    } else {
        console.log('error formatting field as number', value)
    }
}

function mCreatePlaceholderYearData(){
    //reset formatted data array
    mYearData._tmpField = []

    //generate formatted data array
    //re-cast data in form of an array of objects containing the columns value and each cost metric
    for(var m=0;m<mYearData.columns.length;m++) {
        //iterate through each column
        mYearData._tmpField.push({
            m: mYearData.columns[m].key,
        })
        //iterate through the properties of that columns
        for(var n=0;n<mYearData.keys.length;n++) {
            //add to last object in array which is the most recently added object
            mYearData._tmpField[mYearData._tmpField.length-1][mYearData.keys[n]] = 0
        }
    }

    return mYearData._tmpField
}

function mCreateJsonDataEntry(year, data) {
    mYearData.TimeJsonData.push(
        {
            y: year,
            d: data
        }
    )
}

function mLookupColumnLabelfromKey(key) {
    for (var u=0; u<mYearData.columns.length; u++) {
        if(mYearData.columns[u].key == key) {
            return mYearData.columns[u].label
        }
    }
}

function mLookupColPostion(key){
    for (var u=0; u<mYearData.columns.length; u++) {
        if(mYearData.columns[u].key == key) {
            return u
        }
    }
}

function mLookupSummaryColPostion(key) {
    for(var u=0;u<mYearData.summaryColumns.length; u++) {
        if(mYearData.summaryColumns[u].key == key) {
            return u
        }
    }
}


function mYtdTotalCalcuation(key) {
    mYearData._tmpCalc2 = 0
    for(var k=0; k<mYearData.timeTableDataArray.length; k++) {
        if(mYearData.timeTableDataArray[k][key]) {
            mYearData._tmpCalc2 += +mYearData.timeTableDataArray[k][key]
        }
    }
    return mYearData._tmpCalc2
}

function mSumTotalCalcuation(key) {
    mYearData._tmpCalc2 = 0
    for(var l=0; l<mYearData.TimeJsonData.length; l++) {
        for(var k=0; k<mYearData.TimeJsonData[l].d.length; k++) {
            if(mYearData.TimeJsonData[l].d[k][key]) {
                mYearData._tmpCalc2 += +mYearData.TimeJsonData[l].d[k][key]
            }
        }
    }
    return mYearData._tmpCalc2
}

function mSumTotalVarianceCalculation(keys) {
    mYearData._tmpCalc2 = 0
    for(var l=0; l<mYearData.TimeJsonData.length; l++) {
        for(var k=0; k<mYearData.TimeJsonData[l].d.length; k++) {
                mYearData._tmpCalc2 += (
                    //this function assumes 2 string character key with 1st key character minus 2nd key character
                    +((mYearData.TimeJsonData[l].d[k][keys.substring(0,1)]) || 0) - 
                    +((mYearData.TimeJsonData[l].d[k][keys.substring(1,2)]) || 0)
                )
        }
    }
    return mYearData._tmpCalc2
}

function mSumTotalVariance2Calculation(keys) {
    mYearData._tmpCalc2 = 0
    for(var l=0; l<mYearData.TimeJsonData.length; l++) {
        for(var k=0; k<mYearData.TimeJsonData[l].d.length; k++) {
                mYearData._tmpCalc2 += (
                    //this function assumes 3 string character key with 1st key character minus 2nd key character minus 3rd key character
                    +((mYearData.TimeJsonData[l].d[k][keys.substring(0,1)]) || 0) - 
                    +((mYearData.TimeJsonData[l].d[k][keys.substring(1,2)]) || 0) - 
                    +((mYearData.TimeJsonData[l].d[k][keys.substring(2,3)]) || 0)
                )
        }
    }
    return mYearData._tmpCalc2
}

function mUpdateWpStatus(){
    if(mYearData.editMode && 
        typeof WPDPParts != "undefined" && 
        WPDPParts[0]) {

        WPDPParts[0].IsDirty = true;
    } else {
        console.info("warning: unable to flag changes to webpart")
    }
}

function mInitChart(){
    if(//check if chart config object exists
        //tells us if chart has been deployed
        typeof fdChart != 'undefined') {
        //remove contents if already exists
        $("#faBarChart").empty()
        $("#faBarChartTooltip").empty()
        //initialise charts
        cInitApp(true)
        //init chart variable
    } 
}

function mAddLog(entry) {
    if(mYearData.enableLogging) {
        console.log(entry)
    }
}

function mNumberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}