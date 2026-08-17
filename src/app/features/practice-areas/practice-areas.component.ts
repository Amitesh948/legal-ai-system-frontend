import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsPublicService } from '../../core/services/cms/cms-public.service';

@Component({
  selector: 'app-practice-areas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './practice-areas.component.html',
  styleUrls: ['./practice-areas.component.css']
})
export class PracticeAreasComponent implements OnInit {
  cmsService = inject(CmsPublicService);
  practiceAreas: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.cmsService.getPracticeAreas().subscribe({
      next: (res: any) => {
        this.practiceAreas = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
