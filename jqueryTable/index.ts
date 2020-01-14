import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { FinanceAppClass } from './service/financeApp';
import { FinanceAppConfigClass } from './service/financeAppConfig';

import * as $ from "jquery";
import * as d3 from "d3";

export class jqueryTable implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	// Value of the field is stored and used inside the component
	private _value: string;
	//config object for finance app
	private _config: object;
	// PowerApps component framework delegate which will be assigned to this object which would be called whenever any update happens.
	private _notifyOutputChanged: () => void;
	// This element contains all elements of our code component example
	private _container: HTMLDivElement;
	// reference to PowerApps component framework Context object
	private _context: ComponentFramework.Context<IInputs>;
	// Event Handler 'refreshData' reference
	private _refreshData: EventListenerOrEventListenerObject;
	// input element that is used to create the range slider
	private _inputElement: HTMLInputElement;
	// label element created as part of this component
	private _labelElement: HTMLLabelElement;

	private _financeAppService: any = new FinanceAppClass();
	private _financeAppConfigService: any = new FinanceAppConfigClass();
	
	constructor() {}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this._context = context;
		this._container = document.createElement("div");
		this._notifyOutputChanged = notifyOutputChanged;
		this._refreshData = this.refreshData.bind(this);

		this._inputElement = document.createElement("input")
		this._inputElement.addEventListener("input", this._refreshData);

		// creating a HTML label element that shows the value that is set on the linear range component
		this._labelElement = document.createElement("label");

		this._config = this._financeAppConfigService.config;

		this._financeAppService.constructTable(this._config);

		this._container.appendChild(this._inputElement);
		this._container.appendChild(this._labelElement);
		container.appendChild(this._container);
	}

	public refreshData(evt: Event): void {
		this._value = (this._inputElement.value as any) as string;
		this._labelElement.innerHTML = this._inputElement.value;
		this._notifyOutputChanged();
	  }
	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		$(document).ready(function() {

		});
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			mltData: this._value
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		this._inputElement.removeEventListener("input", this._refreshData);
	}
}