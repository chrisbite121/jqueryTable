var tTableConfig = {
    //do not manually modify these properties
    htmlString: '',
    _tmpValue: '',
    noColumns: 0,
    columns: [],
    keys: [],
    labels: [],
    hasHeaderRows: false,
    headerRows: [],
    rows: [],
    timeFieldIds: [],
    summaryFieldIds: [],
    timeColHeaderIds: [],
    rowIds: [],
    mltGuids: [],
    cellClass: '',
    colHeaderClass: '',
    rowHeaderClass: '',
    rowInputClass: '',
    colSummaryClass: '',
    displayMode: true,
    loadDialog: '',
    summaryColumns: [],
    showRowLabels: true,
    noSummaryColumns: 0,
    noTimephasedColumns: 0,
    showColumnTotals: false,
    noTotalColumns: 0,
    totalColumnHeader: '',
    lookupGuids: [],
    lookupLists: {},
    promises:[],
    configVersion:0
}


function tInitDialog() {
    if(SP &&
        SP.UI &&
        SP.UI.ModalDialog &&
        SP.UI.ModalDialog.showWaitScreenWithNoClose) {
            tTableConfig.loadDialog =  SP.UI.ModalDialog.showWaitScreenWithNoClose('Finance App', 'Loading');
    }
    tConfigValidation()
}
function tConfigValidation() {
    //add code to validate config
    tGetConfig();
}

function tGetConfig() {
    //based on config version
    tTableConfig.configVersion = uAppConfigObject.version
    switch(Math.floor(+(tTableConfig.configVersion))) {
        case 1:
            tBuildtConfigVariableVersion1()
        break;
        default:
            alert('Unable to Load Config - App Initialisation failed, please contact your System Administrator')
            tTableConfig.loadDialog.close()
        break;
    }
}

function tBuildtConfigVariableVersion1() {


    //reset local config object properties
    tTableConfig.noColumns = 0;
    tTableConfig.columns = [];
    tTableConfig.keys = [];
    tTableConfig.labels = [];
    tTableConfig.hasHeaderRows = false;
    tTableConfig.headerRows = [];
    tTableConfig.rows = [];
    tTableConfig.timeFieldIds = [];
    tTableConfig.summaryFieldIds = [];
    tTableConfig.totalFieldIds = [];
    tTableConfig.timeColHeaderIds = [];
    tTableConfig.rowIds = [];
    tTableConfig.mltGuids = [];
    tTableConfig.displayMode = true;
    

    //build up local config object
    //REWORK NEEDED TO CATER COLUMN GROUPINGS

    tTableConfig.columns = uAppConfigObject.tableConfig.columns
    
    tTableConfig.summaryColumns = uAppConfigObject.tableConfig.summaryColumns;
    tTableConfig.showRowLabels = uAppConfigObject.tableConfig.showRowLabels;
    tTableConfig.showColumnTotals = uAppConfigObject.tableConfig.showColumnTotals;
    tTableConfig.totalColumnHeader = uAppConfigObject.tableConfig.totalColumnHeader;

    tTableConfig.rows = uAppConfigObject.tableConfig.rows
    tTableConfig.mltGuids = uAppConfigObject.mltGuids

    //build up any lookup table guids
    for(var i=0;i<tTableConfig.summaryColumns.length; i++) {
        if(tTableConfig.summaryColumns[i].type=="lookup") {
            tTableConfig.lookupGuids.push(tTableConfig.summaryColumns[i].guid)
        }
    }

    //build up row config
    for(var i=0;i<tTableConfig.rows.length;i++) {
        if(!tTableConfig.rows[i].headerRow) {
            tTableConfig.keys.push(tTableConfig.rows[i].key)
            tTableConfig.labels.push(tTableConfig.rows[i].label)
        }
        
        //header row config
        if(tTableConfig.rows[i].headerRow) {
            tTableConfig.headerRows.push(tTableConfig.rows[i].label)
        }
    }
        
    if(tTableConfig.headerRows.length > 0){
        tTableConfig.hasHeaderRows = true
    }

    //NO SUMMARY COLUMNS
    //case when no summary columns
    if(tTableConfig.summaryColumns.length == 0) {
        //check if has header rows or showRowlables
        if(tTableConfig.showRowLabels == true || tTableConfig.hasHeaderRows == true) {
            tTableConfig.noSummaryColumns = 1
        }
    } else if (tTableConfig.summaryColumns.length > 0) {
        //add a column for row lables
        if(tTableConfig.showRowLabels == true) {
            tTableConfig.noSummaryColumns = tTableConfig.summaryColumns.length + 1
        } else {
            tTableConfig.noSummaryColumns = tTableConfig.summaryColumns.length
        }
    } else {
        tTableConfig.noSummaryColumns = 0
    }

    //NO TIMEPHASED COLUMNS
    //we may want to implement column groupings at a later date
    tTableConfig.noTimephasedColumns = tTableConfig.columns.length

    //NO TOTAL COLUMNS
    if(tTableConfig.showColumnTotals) {
        tTableConfig.noTotalColumns = 1
    } else {
        tTableConfig.noTotalColumns = 0
    }

    //number of columns determined by summary columns, showRowlables, hasheaderrows, number of column groupings, totals
    tTableConfig.noColumns = tTableConfig.noSummaryColumns + tTableConfig.noTimephasedColumns + tTableConfig.noTotalColumns


    //generate colHeader Ids
    for(var i=0;i<tTableConfig.noTimephasedColumns;i++) {
        tTableConfig.timeColHeaderIds.push(
            'faColHeader_' + tTableConfig.columns[i].key
        )
    }

    //reset global field Ids array and generate new fields ids
    uAppConfigObject.timeFieldIds = []
    //generate row cell Ids
    for(var i=0;i<tTableConfig.rows.length;i++) {
        //generate row Id
        tTableConfig.rowIds.push(
            'faRow_' + tTableConfig.rows[i].key
        )

        //generate timephased cell Ids
        for(var j=0;j<tTableConfig.noTimephasedColumns; j++) {
            
            tTableConfig.timeFieldIds.push(
                'faCell_' + tTableConfig.columns[j].key + '_' + tTableConfig.rows[i].key
            )


            //REFACTOR INTO SEPERATE FUNCTION
            //also push this value into global field Ids to be used by other app components
            //other components need field Id's excluding header rows
            if(tTableConfig.rows[i].headerRow == false) {
                uAppConfigObject.timeFieldIds.push(
                    'faCell_' + tTableConfig.columns[j].key + '_' + tTableConfig.rows[i].key
                )
            }
        }


        for(var j=0; j<tTableConfig.summaryColumns.length; j++) {

            tTableConfig.summaryFieldIds.push(
                'sumCell_' + tTableConfig.summaryColumns[j].key + '_' + tTableConfig.rows[i].key
            )

            //REFACTOR INTO SEPERATE FUNCTION
            //also push this value into global field Ids to be used by other app components
            //other components need field Id's excluding header rows
            if(tTableConfig.rows[i].headerRow == false) {
                uAppConfigObject.summaryFieldIds.push(
                    'sumCell_' + tTableConfig.summaryColumns[j].key + '_' + tTableConfig.rows[i].key
                )
            }
        }


        //column totals ids
        for(var j=0; j<tTableConfig.noTotalColumns; j++) {
            tTableConfig.totalFieldIds.push(
                'totalCell_' + 'tot' + '_' + tTableConfig.rows[i].key
            )
            if(tTableConfig.rows[i].headerRow == false) {
                uAppConfigObject.totalFieldIds.push(
                    'totalCell_' + 'tot' + '_' + tTableConfig.rows[i].key
                )
            }

        }
    }
    tTableConfig.cellClass = uAppConfigObject.tableConfig.cellClass
    tTableConfig.colHeaderClass = uAppConfigObject.tableConfig.colHeaderClass
    tTableConfig.rowHeaderClass = uAppConfigObject.tableConfig.rowHeaderClass
    tTableConfig.rowInputClass = uAppConfigObject.tableConfig.rowInputClass
    tTableConfig.colSummaryClass = uAppConfigObject.tableConfig.colSummaryClass
    tDetermineDisplayMode()
}

function tDetermineDisplayMode() {
    $(document).ready(function () {
        if(tTableConfig.mltGuids[0]
        && $("textarea[guid='" + tTableConfig.mltGuids[0] + "']").length) {
            tTableConfig.displayMode = false;
        }

        if(uAppConfigObject.debugMode === false) {
            $("#" + uAppConfigObject.EcfWebpartId).hide()
        }

        tBuildLookupTableValues()
    });        
}

function tBuildLookupTableValues(){
    $(document).ready(function () {
        //if we have lookups then we need to get the values before constructing the table
        if(tTableConfig.lookupGuids.length > 0) {
             tBuildPromisesArray(tTableConfig.lookupGuids)
            $.when.apply(null, tTableConfig.promises)
                .done(function(){
                     tBuildTable()        
                });
            
        } else {
            tBuildTable()
        }
       
    })
}



function tBuildTable() {
    $('#financeAppContainer').each(function(key, el) {
        //create table element
        $(this).append('<table id="faTable" class="faTable"></table>')
        
        //TOP ROW
        $('#faTable').append('<tr id="faHeaderRow"></tr>')
        //add header th's
        for (var i=0;i<(tTableConfig.noColumns);i++) {
            //it's possible to have header rows and hide the row lables
            if(i == 0 && (tTableConfig.showRowLabels || (tTableConfig.hasHeaderRows && tTableConfig.summaryColumns.length == 0))) {
                //leave header blank if showing row labels
                $('#faHeaderRow').append('<th id="rowHeaderColumn"></th>')
            }
            //summary columns
            else if(i < tTableConfig.noSummaryColumns) {
                $('#faHeaderRow').append('<th class="summaryColumnHeader">' + tTableConfig.summaryColumns[i - (tTableConfig.noSummaryColumns - tTableConfig.summaryColumns.length)].label  + '</th>')
            
            //timephased columns
            } else if(i >= tTableConfig.noSummaryColumns &&
                    i < (tTableConfig.noSummaryColumns + tTableConfig.noTimephasedColumns)) {
                $('#faHeaderRow').append(
                    '<th id="'+ tTableConfig.timeColHeaderIds[i-tTableConfig.noSummaryColumns] +'">'+ tTableConfig.columns[i-tTableConfig.noSummaryColumns].label +'</th>'
                )
            
            //total columns
            } else if(i >= (tTableConfig.noSummaryColumns + tTableConfig.noTimephasedColumns) &&
                    i < tTableConfig.noColumns) {
                $('#faHeaderRow').append('<th id="rowTotalColumn">' + tTableConfig.totalColumnHeader + '</th>')
            }
            
        }

        //BODY ROWS
        for(var i=0; i<tTableConfig.rows.length; i++) {
            if(!tTableConfig.rows[i].headerRow) {
                $('#faTable').append('<tr class="' + tTableConfig.rowInputClass + '" id="' + tTableConfig.rowIds[i] + '">' + tTableConfig.rows[i].label + '</tr>')
            } else {
                $('#faTable').append('<tr class="' + tTableConfig.rowHeaderClass + '" id="' + tTableConfig.rowIds[i] + '">' + tTableConfig.rows[i].label + '</tr>')
            }

            //add columns
            for(var j=0; j<tTableConfig.noColumns; j++) {

                //summary columns
                if(j < tTableConfig.noSummaryColumns) {
                    if(j == 0 && 
                    (tTableConfig.rows[i].headerRow || tTableConfig.showRowLabels)) {
                        //add row heading if setting enabled
                        $('#'+tTableConfig.rowIds[i]).append(
                            '<td class="_faColumnHeaderLabel"><div id="' + tTableConfig.summaryFieldIds[(j - (tTableConfig.noSummaryColumns - tTableConfig.summaryColumns.length)) + (i*tTableConfig.summaryColumns.length)] + '">' + tTableConfig.rows[i].label + '</div></td>'
                        )
                    //add summary columns
                    } else if(j >= (tTableConfig.noSummaryColumns - tTableConfig.summaryColumns.length) &&
                            j < tTableConfig.noSummaryColumns &&
                            !tTableConfig.rows[i].headerRow) {

                                if(!tTableConfig.displayMode) {
                                    //get html for summary column
                                    $('#'+tTableConfig.rowIds[i]).append(
                                        '<td class="faSummaryColumn">' + tGenerateSummaryFieldHtml(tTableConfig.summaryColumns[j - (tTableConfig.noSummaryColumns - tTableConfig.summaryColumns.length)], tTableConfig.summaryFieldIds[(j - (tTableConfig.noSummaryColumns - tTableConfig.summaryColumns.length)) + (i*tTableConfig.summaryColumns.length)]) + '</td>'
                                    )
                                } else {
                                    //get html for summary column
                                    $('#'+tTableConfig.rowIds[i]).append(
                                        '<td class="faSummaryColumn"><div id="' + tTableConfig.summaryFieldIds[(j - (tTableConfig.noSummaryColumns - tTableConfig.summaryColumns.length)) + (i*tTableConfig.summaryColumns.length)] + '"></div></td>'
                                    )
                                }
                    } else {
                        //append blank cell
                        $('#'+tTableConfig.rowIds[i]).append(
                            '<td class="faBlankSummaryColumn"><div id="' + tTableConfig.summaryFieldIds[(j - (tTableConfig.noSummaryColumns - tTableConfig.summaryColumns.length)) + (i*tTableConfig.summaryColumns.length)] + '"></div></td>'
                        )
                    }



                //timephased columns                    
                } else if(j >= tTableConfig.noSummaryColumns &&
                    j < (tTableConfig.noSummaryColumns + tTableConfig.noTimephasedColumns)) {
                    

                    //check if header row
                    if(!tTableConfig.rows[i].headerRow) {
                        //not header row so add input cell using id field
                        if(!tTableConfig.displayMode) {
                            $('#'+tTableConfig.rowIds[i]).append(
                                '<td><input class="' + tTableConfig.cellClass + '" id="' + tTableConfig.timeFieldIds[(j-tTableConfig.noSummaryColumns)+(i*tTableConfig.noTimephasedColumns)] + '" value="0"/></td>'
                            )
                        } else {
                            $('#'+tTableConfig.rowIds[i]).append(
                                '<td><div class="' + tTableConfig.cellClass + '" id="' + tTableConfig.timeFieldIds[(j-tTableConfig.noSummaryColumns)+(i*tTableConfig.noTimephasedColumns)] + '">' + 0 + '</div></td>'
                            )
                        }
                        
                    } else {
                        //if header row do not add input
                        $('#'+tTableConfig.rowIds[i]).append(
                            '<td class="headerRowCell"></td>'
                        )
                    }
                } else if(j >= tTableConfig.noSummaryColumns + tTableConfig.noTimephasedColumns &&
                    j <= tTableConfig.noColumns) {
                        if(!tTableConfig.rows[i].headerRow) {
                            $('#'+tTableConfig.rowIds[i]).append(
                                '<td class="faTotalCell" id="' + tTableConfig.totalFieldIds[i*tTableConfig.noTotalColumns] + '">' + 'Row Total' + '</td>'
                            )
                        } else {
                            $('#'+tTableConfig.rowIds[i]).append(
                                '<td class="faSubTotalCell">' + '' + '</td>'
                            )
                        }
                }
                //totals columns

            }
        }

        //FOOTER ROWS?????????
    });

    tUpdateCellWidths()
    
}

function tUpdateCellWidths() {
    for(var i=0;i<tTableConfig.summaryColumns.length;i++) {
        if(tTableConfig.summaryColumns[i].hasOwnProperty("width")) {
            for(var k=0;k<uAppConfigObject.summaryFieldIds.length;k++) {
                if(uAppConfigObject.summaryFieldIds[k].split('_')[1] == tTableConfig.summaryColumns[i].key) {
                    $("#" +uAppConfigObject.summaryFieldIds[k]).css("min-width",tTableConfig.summaryColumns[i].width)
                }
            }
        }
    }
    tCloseDialog()
}

function tCloseDialog() {
    if(SP &&
        SP.UI &&
        SP.UI.ModalDialog) {
        tTableConfig.loadDialog.close()
    }
    tNextSteps()
}


function tNextSteps() {
    if(typeof mGetParams != 'undefined') {
        mGetParams()        
    } else {
        console.log("unable to init multiyear engine")
    }    
}

function tGenerateSummaryFieldHtml(columnData, fieldId){

    tTableConfig.htmlString = ''
    switch(columnData.type) {
        case 'dropdown':
            tTableConfig.htmlString = tGenerateDropDownhtml(columnData.values, fieldId)
        break;
        case 'lookup':
            tTableConfig.htmlString = tGetEcfLookupValues(columnData.guid, fieldId)
        break;
        case 'text': 
            tTableConfig.htmlString = '<input type="text" id="' + fieldId +'" class="' + tTableConfig.colSummaryClass + '">'
        break;
        default:
            tTableConfig.htmlString = columnData.label
        break;
    }
    return tTableConfig.htmlString
}

function tGenerateDropDownhtml(values, fieldId){
    tTableConfig._tmpValue = '<select id="' + fieldId +'" class="' + tTableConfig.colSummaryClass + '">'
    tTableConfig._tmpValue += '<option value=""></option>';
    for(var i=0;i<values.length; i++) {
        tTableConfig._tmpValue += '<option value="' + String(values[i]) +  '">' + String(values[i]) + '</option>'
        
    }

    tTableConfig._tmpValue += '</select>'
    return tTableConfig._tmpValue
}

function tGetEcfLookupValues(guid, fieldId) {
    //add placheodler 
    //we will update this with actual lookup values in the engine
    tTableConfig._tmpValue = '<select id="' + fieldId +'" class="' + tTableConfig.colSummaryClass + '">'
    tTableConfig._tmpValue += '<option value=""></option>';
    for(var i=0;i<tTableConfig.lookupLists[guid].length;i++) {
        tTableConfig._tmpValue += '<option value="' + String(tTableConfig.lookupLists[guid][i]) +  '">' + String(tTableConfig.lookupLists[guid][i]) + '</option>'
    };
    tTableConfig._tmpValue += '</select>';
    return tTableConfig._tmpValue
}

function tBuildPromisesArray(lookupGuids) {
    for(var i=0;i<lookupGuids.length;i++) {
        tTableConfig.promises.push(
            tBuildAjaxCall(lookupGuids[i])
        )
    }
}

function tBuildAjaxCall(lookupTableId){
    return $.ajax({
        url: _spPageContextInfo.siteAbsoluteUrl + "/_api/projectserver/LookupTables('" + lookupTableId + "')/Entries",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: function (data) { tProcessLookupValues(data, lookupTableId)},
        error: function (data) {console.log("Get lookup table entries API call failed - " + data)}
    });
}


function tProcessLookupValues(data, lookupTableId) {
    if(data.d && data.d.results) {
        tTableConfig.lookupLists[lookupTableId] = []
        for(var i=0;i<data.d.results.length;i++) {
            tTableConfig.lookupLists[lookupTableId].push(data.d.results[i].Value)
        }
    }
}