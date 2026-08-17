import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsPublicService } from '../../services/cms/cms-public.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: []
})
export class FooterComponent implements OnInit {
  cmsService = inject(CmsPublicService);
  settings: any = {};

  ngOnInit() {
    this.cmsService.getSettings().subscribe((res: any) => {
      this.settings = res.data || {};
    });
  }
}
