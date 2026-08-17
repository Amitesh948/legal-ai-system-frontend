import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsPublicService } from '../../core/services/cms/cms-public.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  cmsService = inject(CmsPublicService);
  pageContent: any = null;
  isLoading = true;

  ngOnInit() {
    this.cmsService.getPage('about').subscribe({
      next: (res: any) => {
        this.pageContent = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
