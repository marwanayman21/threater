import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthRequiredModalComponent } from "./services/auth-required-modal.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthRequiredModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'theater-booking';
}
