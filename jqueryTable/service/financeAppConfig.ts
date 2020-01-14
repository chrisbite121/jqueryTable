
export class FinanceAppConfigClass {
    private _config: object

    constructor(){
        this._config = 
        {
            version: 1.0,
            formatAsCurrency: true,
        
            fyOffset: 3,
            tableConfig: {
        
                //leave column array empty if you do not want to use this
                summaryColumns: [
                        // {
                        //     label: 'Resource Name',
                        //     key: 'ResourceName',
                        //     // dropdown for static values
                        //     // lookup for ECF lookup
                        //     // text for free text
                        //     type: 'lookup',
                        //     values: [
                        //         'Project Manager',
                        //         'Programme Manager',
                        //         'Team Member'
                        //     ],
                        //     //specfiy guid if type 'lookup'
                        //     guid: '2ab2d6e3-d690-e911-b089-00155d0cc80f',
                        //     width: "120px"
        
                        // },
                        // {
                        //     label: 'Resource Name',
                        //     key: 'sumcol2',
                        //     // dropdown for static values
                        //     // lookup for ECF lookup
                        //     // text for free text
                        //     type: 'lookup',
                        //     //specfiy guid if type 'lookup'
                        //     guid: '39b37ac1-4bb7-e911-b080-00155d0ce503'
                        // }
                        // ,{
                        //     label: 'Location',
                        //     key: 'location',
                        //     // dropdown for static values
                        //     // lookup for ECF lookup
                        //     // text for free text
                        //     type: 'text',
                        //     //specfiy guid if type 'lookup'
                        //     guid:null
                        // }
                    ],        
                //set these columns in the order that you wish them to appear
                //keep keys short in length, don't use underscores '_' or 'm'!
                columns: [
                            {
                                key: 'Apr',
                                label: 'Apr'
                            },
                            {
                                key: 'May',
                                label: 'May'
                            },
                            {
                                key: 'Jun',
                                label: 'Jun'
                            },
                            {
                                key: 'Jul',
                                label: 'Jul'
                            },
                            {
                                key: 'Aug',
                                label: 'Aug'
                            },
                            {
                                key: 'Sep',
                                label: 'Sep'
                            },
                            {
                                key: 'Oct',
                                label: 'Oct'
                            },
                            {
                                key: 'Nov',
                                label: 'Nov'
                            },
                            {
                                key: 'Dec',
                                label: 'Dec'
                            },
                            {
                                key: 'Jan',
                                label: 'Jan'
                            },
                            {
                                key: 'Feb',
                                label: 'Feb'
                            },
                            {
                                key: 'Mar',
                                label: 'Mar'
                            }
                ],
        
                //set to true if want to display column totals
                showColumnTotals: true,
                //define function for column totals, leave empty string if do not want to show
                columnTotalFunction: 'YtdTotal',
                //text to display in the header of the total column if set to visible
                totalColumnHeader: 'Totals',
                //set to false if you do not want to show the row lables at the beginning of each row - this only applies to non header rows
                showRowLabels: true,
                //keys correspond to the labels array, they should be 1 character in length
                //keep keys short in length, don't use underscores '_' or 'm'!
                //labels will appear in the charts and row headers of the table        
                rows: [
                    {
                        key: 'p',
                        label: 'Travel',
                        headerRow: false
                    },
                    {
                        key: 'f',
                        label: 'CAPEX',
                        headerRow: true,
                    },
                    {
                        key: 'v',
                        label: 'Actual Work',
                        headerRow: false
                    },
                    {
                        key: 'n',
                        label: 'Forecast Work',
                        headerRow: false
                    }, 
                                       
                    {
                        key: 'a',
                        label: 'OPEX',
                        headerRow: true
                    },
                    {
                        key: 'u',
                        label: 'Forecast Work',
                        headerRow: false
                    },
                    {
                        key: 'w',
                        label: 'Actual Work',
                        headerRow: false
                    },
                    {
                        key: 'r',
                        label: 'Forecast Travel',
                        headerRow: false
                    }            
                ],
                cellClass: "faInputField",
                colHeaderClass: "faColHeader",
                colSummaryClass: "faSummaryField",
                rowHeaderClass: "faRowHeader",
                rowInputClass: "faRowInput"
            },
            //used to hold json data
            mltGuids: [
                'd9c1114e-8e99-e911-b07a-00155d0c682d', 
                '88ce357e-539a-e911-b080-00155d08a638',
                'd6011a8f-539a-e911-b076-d29e048db7af',
                'e8797499-539a-e911-b076-96fedec2803c',
                'a90e5aa5-539a-e911-b079-00155d08bb3e'
            ],
            yAxisLabel: 'CAPEX / OPEX Forecast and Actuals',
            selectedYearFieldId: '59370502-b39f-e911-b07e-00155d0c8639',
            calculations: [
                // //note do not use m as a key value
                {
                    //fieldId optional property
                    fieldId: '2e1c1625-02a0-e911-b090-00155d0c4428',
                    function: 'SumTotal',
                    key: 'v',
                    label: 'Total CAPEX Actual Work',
                    //label width optional property
                    // labelWidth: "240px"
                },
                {
                    fieldId: '7d275003-02a0-e911-b081-00155d0ca101',
                    function: 'SumTotal',
                    key: 'n',
                    label: 'Total CAPEX Forecast Work'
                },         
                {
                    fieldId: 'c6dcba13-02a0-e911-b085-00155d083334',
                    function: 'SumTotal',
                    key: 'u',
                    label: 'Total OPEX Forecast Work'
                },
                {
                    fieldId: '9e1329f5-01a0-e911-b090-00155d0c4428',
                    function: 'SumTotal',
                    key: 'w',
                    label: 'Total OPEX Actual Work'
                },
                //use string contatenation of keys for sumVariance - logic will be total of first key minus total of second key
                // {
                //     fieldId: 'ca1a1c19-e11b-ea11-b0d4-00155d0c721f',
                //     function: 'SumVariance',
                //     key: 'vw',
                //     label: 'Variance'
                // },
                //use string contatenation of keys for sumVariance2 - logic will be total of first key minus total of second key minus total of 3rd key
                // {
                //     fieldId: 'ca1a1c19-e11b-ea11-b0d4-00155d0c721f',
                //     function: 'SumVariance2',
                //     key: 'vwu',
                //     label: 'Variance 2'
                // }                  
               
            ],
            EcfWebpartId: 'MSOZoneCell_WebPartWPQ3',
            debugMode: true,
            enableLogging: true,
            //leave as empty array
            timeFieldIds: [],
            summaryFieldIds: [],
            totalFieldIds: []
        }
    }

    get config() {
        return this._config
    }
}
