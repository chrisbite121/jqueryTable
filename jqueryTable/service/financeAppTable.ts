import { IFinanceAppTableConfig } from '../model/IFinanceAppTable';
import { IFinanceAppConfig } from '../model/IFinanceAppConfig';

export interface IApiResult {
        d?: {
            results: Array<any>
        }
}
export class FinanceAppTableClass {
    private tTableConfig: IFinanceAppTableConfig;
    
    constructor(){
        console.log("Finance App Class initiated")
        this.setTabeConfig()
    }

    protected constructTable(config:IFinanceAppConfig):HTMLDivElement
    {
        let tableHTML: HTMLDivElement = document.createElement('div');
        console.log(config);
        console.log('construct table called')
        this.tGetConfig(config);
        this.tbuildConfigVariable(config);
        this.tDetermineDisplayMode();
        //move determine debug mode to another class?
        this.tDetermineDebugMode(config);
        //if we have lookups then we need to get the values before constructing the table
        if(this.tTableConfig.lookupGuids.length > 0) {
            //NOTE NEED TO IMPLEMENT CONTENT FOR THIS FUNCTION FOR POWERAPPS
            this.tBuildPromisesArray(this.tTableConfig.lookupGuids)
           $.when.apply(null, this.tTableConfig.promises)
               .done(() => {
                  tableHTML = this.tBuildTable()        
               });
           
       } else {
           tableHTML = this.tBuildTable()
       }
       this.tUpdateCellWidths(config)
       return tableHTML
    }


    private setTabeConfig() {
        this.tTableConfig = {
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
            configVersion:0,
            totalFieldIds: []
        }
    }
    
    private tGetConfig(config: IFinanceAppConfig) {
        //based on config version
        this.tTableConfig.configVersion = config.version

    }
    
    private tbuildConfigVariable(config: IFinanceAppConfig){
        switch(Math.floor(+(this.tTableConfig.configVersion))) {
            case 1:
                this.tBuildtConfigVariableVersion1(config)
            break;
            default:
                alert('Unable to Load Config - App Initialisation failed, please contact your System Administrator')
            break;
        }
    }

    private tBuildtConfigVariableVersion1(config: any) {


        //reset local config object properties
        this.tTableConfig.noColumns = 0;
        this.tTableConfig.columns = [];
        this.tTableConfig.keys = [];
        this.tTableConfig.labels = [];
        this.tTableConfig.hasHeaderRows = false;
        this.tTableConfig.headerRows = [];
        this.tTableConfig.rows = [];
        this.tTableConfig.timeFieldIds = [];
        this.tTableConfig.summaryFieldIds = [];
        this.tTableConfig.totalFieldIds = [];
        this.tTableConfig.timeColHeaderIds = [];
        this.tTableConfig.rowIds = [];
        this.tTableConfig.mltGuids = [];
        this.tTableConfig.displayMode = true;
        
    
        //build up local config object
        //REWORK NEEDED TO CATER COLUMN GROUPINGS
    
        this.tTableConfig.columns = config.tableConfig.columns
        
        this.tTableConfig.summaryColumns = config.tableConfig.summaryColumns;
        this.tTableConfig.showRowLabels = config.tableConfig.showRowLabels;
        this.tTableConfig.showColumnTotals = config.tableConfig.showColumnTotals;
        this.tTableConfig.totalColumnHeader = config.tableConfig.totalColumnHeader;
    
        this.tTableConfig.rows = config.tableConfig.rows
        this.tTableConfig.mltGuids = config.mltGuids
    
        //build up any lookup table guids
        for(var i=0;i<this.tTableConfig.summaryColumns.length; i++) {
            if(this.tTableConfig.summaryColumns[i].type=="lookup") {
                this.tTableConfig.lookupGuids.push(this.tTableConfig.summaryColumns[i].guid)
            }
        }
    
        //build up row config
        for(var i=0;i<this.tTableConfig.rows.length;i++) {
            if(!this.tTableConfig.rows[i].headerRow) {
                this.tTableConfig.keys.push(this.tTableConfig.rows[i].key)
                this.tTableConfig.labels.push(this.tTableConfig.rows[i].label)
            }
            
            //header row config
            if(this.tTableConfig.rows[i].headerRow) {
                this.tTableConfig.headerRows.push(this.tTableConfig.rows[i].label)
            }
        }
            
        if(this.tTableConfig.headerRows.length > 0){
            this.tTableConfig.hasHeaderRows = true
        }
    
        //NO SUMMARY COLUMNS
        //case when no summary columns
        if(this.tTableConfig.summaryColumns.length == 0) {
            //check if has header rows or showRowlables
            if(this.tTableConfig.showRowLabels == true || this.tTableConfig.hasHeaderRows == true) {
                this.tTableConfig.noSummaryColumns = 1
            }
        } else if (this.tTableConfig.summaryColumns.length > 0) {
            //add a column for row lables
            if(this.tTableConfig.showRowLabels == true) {
                this.tTableConfig.noSummaryColumns = this.tTableConfig.summaryColumns.length + 1
            } else {
                this.tTableConfig.noSummaryColumns = this.tTableConfig.summaryColumns.length
            }
        } else {
            this.tTableConfig.noSummaryColumns = 0
        }
    
        //NO TIMEPHASED COLUMNS
        //we may want to implement column groupings at a later date
        this.tTableConfig.noTimephasedColumns = this.tTableConfig.columns.length
    
        //NO TOTAL COLUMNS
        if(this.tTableConfig.showColumnTotals) {
            this.tTableConfig.noTotalColumns = 1
        } else {
            this.tTableConfig.noTotalColumns = 0
        }
    
        //number of columns determined by summary columns, showRowlables, hasheaderrows, number of column groupings, totals
        this.tTableConfig.noColumns = this.tTableConfig.noSummaryColumns + this.tTableConfig.noTimephasedColumns + this.tTableConfig.noTotalColumns
    
    
        //generate colHeader Ids
        for(var i=0;i<this.tTableConfig.noTimephasedColumns;i++) {
            this.tTableConfig.timeColHeaderIds.push(
                'faColHeader_' + this.tTableConfig.columns[i].key
            )
        }
    
        //reset global field Ids array and generate new fields ids
        config.timeFieldIds = []
        //generate row cell Ids
        for(var i=0;i<this.tTableConfig.rows.length;i++) {
            //generate row Id
            this.tTableConfig.rowIds.push(
                'faRow_' + this.tTableConfig.rows[i].key
            )
    
            //generate timephased cell Ids
            for(var j=0;j<this.tTableConfig.noTimephasedColumns; j++) {
                
                this.tTableConfig.timeFieldIds.push(
                    'faCell_' + this.tTableConfig.columns[j].key + '_' + this.tTableConfig.rows[i].key
                )
    
    
                //REFACTOR INTO SEPERATE FUNCTION
                //also push this value into global field Ids to be used by other app components
                //other components need field Id's excluding header rows
                // if(this.tTableConfig.rows[i].headerRow == false) {
                //     config.timeFieldIds.push(
                //         'faCell_' + this.tTableConfig.columns[j].key + '_' + this.tTableConfig.rows[i].key
                //     )
                // }
            }
    
    
            for(var j=0; j<this.tTableConfig.summaryColumns.length; j++) {
    
                this.tTableConfig.summaryFieldIds.push(
                    'sumCell_' + this.tTableConfig.summaryColumns[j].key + '_' + this.tTableConfig.rows[i].key
                )
    
                //REFACTOR INTO SEPERATE FUNCTION
                //also push this value into global field Ids to be used by other app components
                //other components need field Id's excluding header rows
                // if(this.tTableConfig.rows[i].headerRow == false) {
                //     config.summaryFieldIds.push(
                //         'sumCell_' + this.tTableConfig.summaryColumns[j].key + '_' + this.tTableConfig.rows[i].key
                //     )
                // }
            }
    
    
            //column totals ids
            for(var j=0; j<this.tTableConfig.noTotalColumns; j++) {
                this.tTableConfig.totalFieldIds.push(
                    'totalCell_' + 'tot' + '_' + this.tTableConfig.rows[i].key
                )
                // if(this.tTableConfig.rows[i].headerRow == false) {
                //     config.totalFieldIds.push(
                //         'totalCell_' + 'tot' + '_' + this.tTableConfig.rows[i].key
                //     )
                // }
    
            }
        }
        this.tTableConfig.cellClass = config.tableConfig.cellClass
        this.tTableConfig.colHeaderClass = config.tableConfig.colHeaderClass
        this.tTableConfig.rowHeaderClass = config.tableConfig.rowHeaderClass
        this.tTableConfig.rowInputClass = config.tableConfig.rowInputClass
        this.tTableConfig.colSummaryClass = config.tableConfig.colSummaryClass
        
    }

    private tDetermineDisplayMode() {
        
        //METHOD NOT RELEVANT TO POWERAPPS - HOW DO WE CHECK DISPLAYMODE IN A POWERAPPS FORM?

        // $(document).ready(() => {
        //     if(this.tTableConfig.mltGuids[0]
        //     && $("textarea[guid='" + this.tTableConfig.mltGuids[0] + "']").length) {
        //         this.tTableConfig.displayMode = false;
        //     }


        // });
        this.tTableConfig.displayMode = false;        
    }

    private tDetermineDebugMode(config: IFinanceAppConfig){
        if(config.debugMode === false) {
            //DO WE NEED THIS FUNCTION IN POWERAPPS
            // $("#" + config.EcfWebpartId).hide()
        }
    }

    private tBuildTable(): HTMLDivElement {
        //create container element
        let divContainerElement: HTMLDivElement = document.createElement("div");
        divContainerElement.setAttribute('id','financeAppContainer');

        //create table element
        let tableElement: HTMLTableElement = document.createElement("table");
        tableElement.setAttribute('id', 'faTable');
        tableElement.setAttribute('class', 'faTable');

        //append table element to container element
        divContainerElement.appendChild(tableElement);

        //create and append TOP ROW
        let topRowElement: HTMLTableRowElement = document.createElement('tr');
        topRowElement.setAttribute('id', 'faHeaderRow');

        //append top row to table element
        tableElement.appendChild(topRowElement);

        // $('#financeAppContainer').each((key, el) => {
        //     //create table element
        //     $(this).append('<table id="faTable" class="faTable"></table>')
            
        //     //TOP ROW
        //     $('#faTable').append('<tr id="faHeaderRow"></tr>')
        //add header th's
        for (var i=0;i<(this.tTableConfig.noColumns);i++) {
            //it's possible to have header rows and hide the row lables
            if(i == 0 && (this.tTableConfig.showRowLabels || (this.tTableConfig.hasHeaderRows && this.tTableConfig.summaryColumns.length == 0))) {
                //leave header blank if showing row labels
                // $('#faHeaderRow').append('<th id="rowHeaderColumn"></th>')
                let tableHeaderElement: HTMLTableHeaderCellElement = document.createElement('th');
                tableHeaderElement.setAttribute('id', 'rowHeaderColumn')
                topRowElement.appendChild(tableHeaderElement)
            }
            //summary columns
            else if(i < this.tTableConfig.noSummaryColumns) {
                // $('#faHeaderRow').append('<th class="summaryColumnHeader">' + this.tTableConfig.summaryColumns[i - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)].label  + '</th>')
                let tableHeaderElement2: HTMLTableHeaderCellElement = document.createElement('th');
                tableHeaderElement2.setAttribute('class', 'summaryColumnHeader');
                tableHeaderElement2.innerText = this.tTableConfig.summaryColumns[i - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)].label;
                topRowElement.appendChild(tableHeaderElement2);
                
            //timephased columns
            } else if(i >= this.tTableConfig.noSummaryColumns &&
                    i < (this.tTableConfig.noSummaryColumns + this.tTableConfig.noTimephasedColumns)) {
                // $('#faHeaderRow').append(
                //     '<th id="'+ this.tTableConfig.timeColHeaderIds[i-this.tTableConfig.noSummaryColumns] +'">'+ this.tTableConfig.columns[i-this.tTableConfig.noSummaryColumns].label +'</th>'
                // )
                let tableHeaderElement3: HTMLTableHeaderCellElement = document.createElement('th');
                tableHeaderElement3.setAttribute('id', this.tTableConfig.timeColHeaderIds[i-this.tTableConfig.noSummaryColumns])
                tableHeaderElement3.innerText = this.tTableConfig.columns[i-this.tTableConfig.noSummaryColumns].label
                topRowElement.appendChild(tableHeaderElement3)
                
            //total columns
            } else if(i >= (this.tTableConfig.noSummaryColumns + this.tTableConfig.noTimephasedColumns) &&
                    i < this.tTableConfig.noColumns) {
                // $('#faHeaderRow').append('<th id="rowTotalColumn">' + this.tTableConfig.totalColumnHeader + '</th>')
                let tableHeaderElement4: HTMLTableHeaderCellElement = document.createElement('th');
                tableHeaderElement4.setAttribute('id', 'rowTotalColumn');
                tableHeaderElement4.innerText = this.tTableConfig.totalColumnHeader;
                topRowElement.appendChild(tableHeaderElement4);
            }
                
        }
    
        //BODY ROWS
        for(var i=0; i<this.tTableConfig.rows.length; i++) {
            let bodyRowElement: HTMLTableRowElement = document.createElement('tr');
            if(!this.tTableConfig.rows[i].headerRow) {
                // $('#faTable').append('<tr class="' + this.tTableConfig.rowInputClass + '" id="' + this.tTableConfig.rowIds[i] + '">' + this.tTableConfig.rows[i].label + '</tr>')
                //create and append BODY ROW
                
                bodyRowElement.setAttribute('id', this.tTableConfig.rowIds[i]);
                bodyRowElement.setAttribute('class', this.tTableConfig.rowInputClass);
                bodyRowElement.innerText =  this.tTableConfig.rows[i].label
                //append body row to table element
                tableElement.appendChild(bodyRowElement);
            } else {
                // $('#faTable').append('<tr class="' + this.tTableConfig.rowHeaderClass + '" id="' + this.tTableConfig.rowIds[i] + '">' + this.tTableConfig.rows[i].label + '</tr>')
                //create and append BODY ROW
                let bodyRowElement: HTMLTableRowElement = document.createElement('tr');
                bodyRowElement.setAttribute('id', this.tTableConfig.rowIds[i]);
                bodyRowElement.setAttribute('class', this.tTableConfig.rowInputClass);
                bodyRowElement.innerText =  this.tTableConfig.rows[i].label
                //append body row to table element
                tableElement.appendChild(bodyRowElement);
            }

            //add columns
            for(var j=0; j<this.tTableConfig.noColumns; j++) {

                //summary columns
                if(j < this.tTableConfig.noSummaryColumns) {
                    if(j == 0 && 
                    (this.tTableConfig.rows[i].headerRow || this.tTableConfig.showRowLabels)) {
                        //add row heading if setting enabled
                        // $('#'+this.tTableConfig.rowIds[i]).append(
                        //     '<td class="_faColumnHeaderLabel"><div id="' + this.tTableConfig.summaryFieldIds[(j - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)) + (i*this.tTableConfig.summaryColumns.length)] + '">' + this.tTableConfig.rows[i].label + '</div></td>'
                        // )
                        //create cell element
                        let bodyCellElement: HTMLTableCellElement = document.createElement('td');
                        bodyCellElement.setAttribute('class', '_faColumnHeaderLabel')

                        //create div element
                        let divCellElement: HTMLDivElement = document.createElement('div');
                        divCellElement.setAttribute('id', this.tTableConfig.summaryFieldIds[(j - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)) + (i*this.tTableConfig.summaryColumns.length)])
                        divCellElement.innerText = this.tTableConfig.rows[i].label

                        //append div to cell
                        bodyCellElement.appendChild(divCellElement);
                        //append cell to body row
                        bodyRowElement.appendChild(bodyCellElement);
                        
                    //add summary columns
                    } else if(j >= (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length) &&
                            j < this.tTableConfig.noSummaryColumns &&
                            !this.tTableConfig.rows[i].headerRow) {

                                if(!this.tTableConfig.displayMode) {
                                    //get html for summary column
                                    // $('#'+this.tTableConfig.rowIds[i]).append(
                                    //     '<td class="faSummaryColumn">' + this.tGenerateSummaryFieldHtml(this.tTableConfig.summaryColumns[j - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)], this.tTableConfig.summaryFieldIds[(j - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)) + (i*this.tTableConfig.summaryColumns.length)]) + '</td>'
                                    // )
                                    let bodyCellElement2: HTMLTableCellElement = document.createElement('td');
                                    bodyCellElement2.innerHTML = this.tGenerateSummaryFieldHtml(this.tTableConfig.summaryColumns[j - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)], this.tTableConfig.summaryFieldIds[(j - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)) + (i*this.tTableConfig.summaryColumns.length)]);
                                    //append cell to body row
                                    bodyRowElement.appendChild(bodyCellElement2);
                                } else {
                                    //get html for summary column
                                    // $('#'+this.tTableConfig.rowIds[i]).append(
                                    //     '<td class="faSummaryColumn"><div id="' + this.tTableConfig.summaryFieldIds[(j - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)) + (i*this.tTableConfig.summaryColumns.length)] + '"></div></td>'
                                    // )
                                    let bodyCellElement3: HTMLTableCellElement = document.createElement('td');
                                    bodyCellElement3.setAttribute('class', 'faSummaryColumn')
                                    let divCellElement2: HTMLDivElement = document.createElement('div');
                                    divCellElement2.id = this.tTableConfig.summaryFieldIds[(j - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)) + (i*this.tTableConfig.summaryColumns.length)];
                                    bodyCellElement3.appendChild(divCellElement2);
                                    bodyRowElement.appendChild(bodyCellElement3);
                                }
                    } else {
                        //append blank cell
                        // $('#'+this.tTableConfig.rowIds[i]).append(
                        //     '<td class="faBlankSummaryColumn"><div id="' + this.tTableConfig.summaryFieldIds[(j - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)) + (i*this.tTableConfig.summaryColumns.length)] + '"></div></td>'
                        // )
                        let bodyCellElement4: HTMLTableCellElement = document.createElement('td');
                        bodyCellElement4.setAttribute('class', 'faBlankSummaryColumn');
                        let divCellElement3: HTMLDivElement = document.createElement('div');
                        divCellElement3.id = this.tTableConfig.summaryFieldIds[(j - (this.tTableConfig.noSummaryColumns - this.tTableConfig.summaryColumns.length)) + (i*this.tTableConfig.summaryColumns.length)];
                        bodyCellElement4.appendChild(divCellElement3);
                        bodyRowElement.appendChild(bodyCellElement4);
                    }



                //timephased columns                    
                } else if(j >= this.tTableConfig.noSummaryColumns &&
                    j < (this.tTableConfig.noSummaryColumns + this.tTableConfig.noTimephasedColumns)) {
                    

                    //check if header row
                    if(!this.tTableConfig.rows[i].headerRow) {
                        //not header row so add input cell using id field
                        if(!this.tTableConfig.displayMode) {
                            // $('#'+this.tTableConfig.rowIds[i]).append(
                            //     '<td><input class="' + this.tTableConfig.cellClass + '" id="' + this.tTableConfig.timeFieldIds[(j-this.tTableConfig.noSummaryColumns)+(i*this.tTableConfig.noTimephasedColumns)] + '" value="0"/></td>'
                            // )
                            let timePhasedCellElement1: HTMLTableCellElement = document.createElement('td');
                            let inputElement1: HTMLInputElement = document.createElement('input');
                            inputElement1.setAttribute('class', this.tTableConfig.cellClass);
                            inputElement1.id = this.tTableConfig.timeFieldIds[(j-this.tTableConfig.noSummaryColumns)+(i*this.tTableConfig.noTimephasedColumns)];
                            inputElement1.setAttribute('value', '0');
                            timePhasedCellElement1.appendChild(inputElement1);
                            bodyRowElement.appendChild(timePhasedCellElement1);
                        } else {
                            // $('#'+this.tTableConfig.rowIds[i]).append(
                            //     '<td><div class="' + this.tTableConfig.cellClass + '" id="' + this.tTableConfig.timeFieldIds[(j-this.tTableConfig.noSummaryColumns)+(i*this.tTableConfig.noTimephasedColumns)] + '">' + 0 + '</div></td>'
                            // )
                            let timePhasedCellElement2: HTMLTableCellElement = document.createElement('td');
                            let divElement4: HTMLDivElement = document.createElement('div');
                            divElement4.setAttribute('class', this.tTableConfig.cellClass);
                            divElement4.id = this.tTableConfig.timeFieldIds[(j-this.tTableConfig.noSummaryColumns)+(i*this.tTableConfig.noTimephasedColumns)];
                            divElement4.innerHTML = '0';
                            timePhasedCellElement2.appendChild(divElement4);
                            bodyRowElement.appendChild(timePhasedCellElement2);                            
                        }
                        
                    } else {
                        //if header row do not add input
                        // $('#'+this.tTableConfig.rowIds[i]).append(
                        //     '<td class="headerRowCell"></td>'
                        // )
                        let tableCellPlaceholder1: HTMLTableCellElement = document.createElement('td')
                        tableCellPlaceholder1.setAttribute('class', 'headerRowCell')
                        bodyRowElement.appendChild(tableCellPlaceholder1)
                    }
                } else if(j >= this.tTableConfig.noSummaryColumns + this.tTableConfig.noTimephasedColumns &&
                    j <= this.tTableConfig.noColumns) {
                        if(!this.tTableConfig.rows[i].headerRow) {
                            // $('#'+this.tTableConfig.rowIds[i]).append(
                            //     '<td class="faTotalCell" id="' + this.tTableConfig.totalFieldIds[i*this.tTableConfig.noTotalColumns] + '">' + 'Row Total' + '</td>'
                            // )
                            let tableCellTotalField1: HTMLTableCellElement = document.createElement('td');
                            tableCellTotalField1.id = this.tTableConfig.totalFieldIds[i*this.tTableConfig.noTotalColumns];
                            tableCellTotalField1.innerHTML = 'Row Total'
                            bodyRowElement.appendChild(tableCellTotalField1)
                        } else {
                            // $('#'+this.tTableConfig.rowIds[i]).append(
                            //     '<td class="faSubTotalCell">' + '' + '</td>'
                            // )
                            let tableCellSubTotal: HTMLTableCellElement = document.createElement('td');
                            tableCellSubTotal.setAttribute('class', 'faSubTotalCell');
                            bodyRowElement.appendChild(tableCellSubTotal);
                        }
                }
                //totals columns

            }
        }
    
            //FOOTER ROWS?????????
        // });
    
        return divContainerElement
        
    }

    protected tUpdateCellWidths(config: IFinanceAppConfig) {
        for(var i=0;i<this.tTableConfig.summaryColumns.length;i++) {
            if(this.tTableConfig.summaryColumns[i].hasOwnProperty("width")) {
                for(var k=0;k<config.summaryFieldIds.length;k++) {
                    if(config.summaryFieldIds[k].split('_')[1] == this.tTableConfig.summaryColumns[i].key) {
                        $("#" +config.summaryFieldIds[k]).css("min-width",this.tTableConfig.summaryColumns[i].width)
                    }
                }
            }
        }
    }
    
    
   
    protected tGenerateSummaryFieldHtml(columnData:IFinanceAppTableConfig["summaryColumns"], fieldId:string){
    
        this.tTableConfig.htmlString = ''
        switch(columnData.type) {
            case 'dropdown':
                this.tTableConfig.htmlString = this.tGenerateDropDownhtml(columnData.values, fieldId)
            break;
            case 'lookup':
                this.tTableConfig.htmlString = this.tGetEcfLookupValues(columnData.guid, fieldId)
            break;
            case 'text': 
                this.tTableConfig.htmlString = '<input type="text" id="' + fieldId +'" class="' + this.tTableConfig.colSummaryClass + '">'
            break;
            default:
                this.tTableConfig.htmlString = columnData.label
            break;
        }
        return this.tTableConfig.htmlString
    }
    
    protected tGenerateDropDownhtml(values:Array<number|string>, fieldId:string){
        this.tTableConfig._tmpValue = '<select id="' + fieldId +'" class="' + this.tTableConfig.colSummaryClass + '">'
        this.tTableConfig._tmpValue += '<option value=""></option>';
        for(var i=0;i<values.length; i++) {
            this.tTableConfig._tmpValue += '<option value="' + String(values[i]) +  '">' + String(values[i]) + '</option>'
            
        }
    
        this.tTableConfig._tmpValue += '</select>'
        return this.tTableConfig._tmpValue
    }
    
    protected tGetEcfLookupValues(guid:string, fieldId:string) {
        //add placheodler 
        //we will update this with actual lookup values in the engine
        this.tTableConfig._tmpValue = '<select id="' + fieldId +'" class="' + this.tTableConfig.colSummaryClass + '">'
        this.tTableConfig._tmpValue += '<option value=""></option>';
        for(var i=0;i<this.tTableConfig.lookupLists[guid].length;i++) {
            this.tTableConfig._tmpValue += '<option value="' + String(this.tTableConfig.lookupLists[guid][i]) +  '">' + String(this.tTableConfig.lookupLists[guid][i]) + '</option>'
        };
        this.tTableConfig._tmpValue += '</select>';
        return this.tTableConfig._tmpValue
    }
    
    protected tBuildPromisesArray(lookupGuids:Array<string>) {
        for(var i=0;i<lookupGuids.length;i++) {
            this.tTableConfig.promises.push(
                this.tBuildAjaxCall(lookupGuids[i])
            )
        }
    }
    
    protected tBuildAjaxCall(lookupTableId:string){
        //are we going to build up lookup tables from a powerapps app??

        // return $.ajax({
        //     url: _spPageContextInfo.siteAbsoluteUrl + "/_api/projectserver/LookupTables('" + lookupTableId + "')/Entries",
        //     method: "GET",
        //     headers: {
        //         "Accept": "application/json; odata=verbose"
        //     },
        //     success: function (data) { this.tProcessLookupValues(data, lookupTableId)},
        //     error: function (data) {console.log("Get lookup table entries API call failed - " + data)}
        // });

        return;
    }
    
    
    protected tProcessLookupValues(data:IApiResult, lookupTableId:string) {
        if(data.d && data.d.results) {
            this.tTableConfig.lookupLists[lookupTableId] = []
            for(var i=0;i<data.d.results.length;i++) {
                this.tTableConfig.lookupLists[lookupTableId].push(data.d.results[i].Value)
            }
        }
    }



    protected generateTimeFieldIds (config: IFinanceAppConfig): IFinanceAppConfig {
        //reset global field Ids array and generate new fields ids
        config.timeFieldIds = []
        //generate row cell Ids
        for(var i=0;i<this.tTableConfig.rows.length;i++) {
    
            //generate timephased cell Ids
            for(var j=0;j<this.tTableConfig.noTimephasedColumns; j++) {
                
                //REFACTOR INTO SEPERATE FUNCTION
                //also push this value into global field Ids to be used by other app components
                //other components need field Id's excluding header rows
                if(this.tTableConfig.rows[i].headerRow == false) {
                    config.timeFieldIds.push(
                        'faCell_' + this.tTableConfig.columns[j].key + '_' + this.tTableConfig.rows[i].key
                    )
                }
            }

            for(var j=0; j<this.tTableConfig.summaryColumns.length; j++) {
    
                //REFACTOR INTO SEPERATE FUNCTION
                //also push this value into global field Ids to be used by other app components
                //other components need field Id's excluding header rows
                if(this.tTableConfig.rows[i].headerRow == false) {
                    config.summaryFieldIds.push(
                        'sumCell_' + this.tTableConfig.summaryColumns[j].key + '_' + this.tTableConfig.rows[i].key
                    )
                }
            }

            //column totals ids
            for(var j=0; j<this.tTableConfig.noTotalColumns; j++) {

                if(this.tTableConfig.rows[i].headerRow == false) {
                    config.totalFieldIds.push(
                        'totalCell_' + 'tot' + '_' + this.tTableConfig.rows[i].key
                    )
                }
    
            }
        }

        return config
    }

}

