import { Component, Input } from "@angular/core";

@Component({
    selector: 'loading',
    template: `
        <div style="padding: 0 10px 0 10px; font-weight: bold; font-size: 18px;">{{text}}
            <i class="fa fa-spinner fa-spin fa-2x"></i>
        </div>
    `
})
export class LoadingComponent {
    @Input() text: string
}