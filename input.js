// CSS for the component.
const STYLE = `
    * {
        transition:.25s ease-out;
    }
    :host {
        box-sizing:border-box;
        display:flex;
        flex-direction:column;
        --padding-left:0.5rem;
        --padding-top:1rem;
        --padding-bottom:0.5rem;
    }
    .wrapper {
        background-color:#ddd; /* Background color of the custom element */
        box-sizing:border-box;
        display:flex;
        flex-direction:column;
        position:relative;
    }
    label, input {
        background-color:transparent;
        border:0;
    }
    label {
        color:gray;
        font-size:small;
        position:absolute;
        top:50%;
        transform:translateY(-50%);
        left:0.5rem;
        pointer-events:none;
    }
    input {
        box-sizing:border-box;
        height:100%;
        width:100%;
        padding-left:var(--padding-left);
        padding-top:var(--padding-top);
        padding-bottom:var(--padding-bottom);
    }
    input::placeholder {
        color:transparent;
    }
    input:active + label, input:focus + label, input:not(:placeholder-shown) + label {
        top:0;
        translate: 0 50%;
        color:blue;
    }
    input:active, input:focus {
        outline:none;
    }
    .outline {
        background-color:none;
        height:.2rem;
        width:100%;
    }
    input:active ~ .outline, input:focus ~ .outline, input:not(:placeholder-shown) ~ .outline {
        background-color:blue;
    }
`

/**
 * Class for a custom input element.
 * 
 * 1. The components validity (in a form submission) is updated whenever the value of the component is updated. 
 */
export default class UiInput extends HTMLElement {

    static formAssociated = true
    static observedAttributes = ["message", "placeholder", "required", "value"];

    constructor() {
        super()
        this._internals = this.attachInternals()
    }

    /**
     * Updates attributes in the shadow root provided there 
     * is a shadow root attached.
     */
    updateAttributes() {
        const shadowRootNotAttached = this.shadowRoot === null
        if(shadowRootNotAttached) return;

        const attributes = this.getAttributeNames()
        attributes.forEach(attribute => {
            const value = this.getAttribute(attribute)
            if(attribute === "placeholder") {
                this.shadowRoot.querySelector("label").textContent = value
                return this.shadowRoot.querySelector("input").placeholder = value
            }
            if(attribute === "message") {
                return this.shadowRoot.querySelector("message").textContent = value
            }
            if(attribute === "required") {
                const state = value === "false" ? false : true
                return this.shadowRoot.querySelector("input").setAttribute("required", state)
            }
            this.shadowRoot.querySelector("input").setAttribute(attribute, value)
        })
    }

    attributeChangedCallback(attribute, oldValue, newValue) {
        this.updateAttributes()
    }

    connectedCallback() {
        const shadow = this.attachShadow({mode:"open", delegatesFocus: true})

        // Create elements
        const label = document.createElement("label")
        label.for = "input"

        const input = document.createElement("input")
        input.id = "input"
        input.name = "input"  
        input.tabIndex = 0
        const outline = document.createElement("div")
        outline.classList.add("outline")

        const message = document.createElement("span")
        message.classList.add("message")
        
        const wrapper = document.createElement("div")
        wrapper.classList.add("wrapper")
        
        const style = document.createElement("style")
        style.insertAdjacentHTML("beforeend", STYLE)
        
        // Assemble component
        shadow.appendChild(style)
        shadow.appendChild(wrapper)
        wrapper.appendChild(input)
        wrapper.appendChild(label)
        wrapper.appendChild(outline)
        shadow.appendChild(message)

        input.addEventListener("input", e => {
            this.value = input.value
        })

        // Sets attributes
        this.updateAttributes()
        this._setValidity()
    }

    /**
     * Sets the internal validity as the the same as the input elements 
     * validity.
     */
    _setValidity() {
        const SHADOW_ROOT_NOT_ATTACHED = this.shadowRoot === null
        if(SHADOW_ROOT_NOT_ATTACHED) return 
        
        const input = this.shadowRoot.querySelector("input")
        
        for(const key in input.validity) {
            const IS_INVALID = input.validity[key];
            if(IS_INVALID) {
                this._internals.setValidity({[key]:true}, input.validationMessage, input);
                break;
            }
        }
    }

    // Methods for implementing the element as a form element.
    get value() {
        return this.shadowRoot.querySelector("input").value
    }

    set value(value) {
        this.setAttribute("value", value)
        this._setValidity()
    }

    //------------------------------------------------------------
    // Bloat
    //------------------------------------------------------------
    get form() {
        return this.internals.form;
    }
    
    get name() { 
        return this.getAttribute('name'); 
    }

    get type() { 
        return this.localName; 
    }

    get validity() {
        return this.internals.validity; 
    }

    get validationMessage() {
        return this.internals.validationMessage; 
    }

    get willValidate() {
        return this.internals.willValidate; 
    }

    checkValidity() { 
        return this._internals.checkValidity(); 
    }

    reportValidity() {
        return this._internals.reportValidity(); 
    }
}
customElements.define("ui-input", UiInput)