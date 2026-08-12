import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-practice-areas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './practice-areas.component.html',
  styleUrls: ['./practice-areas.component.css']
})
export class PracticeAreasComponent {}
