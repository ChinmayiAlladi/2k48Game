import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from '../grid/grid.component';
import { FooterComponent } from '../footer/footer.component';

/** main component of the app */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GridComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
}
