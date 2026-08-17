import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsPublicService } from '../../core/services/cms/cms-public.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  cmsService = inject(CmsPublicService);
  homeData: any = {};
  isLoading = true;

  ngOnInit() {
    this.cmsService.getHome().subscribe({
      next: (res: any) => {
        this.homeData = res.data || {};
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
