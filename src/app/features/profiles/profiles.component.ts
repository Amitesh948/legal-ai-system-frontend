import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsPublicService } from '../../core/services/cms/cms-public.service';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {
  cmsService = inject(CmsPublicService);
  attorneys: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.cmsService.getAttorneys().subscribe({
      next: (res: any) => {
        this.attorneys = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
