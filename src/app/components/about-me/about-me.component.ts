import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss'
})
export class AboutMeComponent implements OnInit, OnDestroy {
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit(): void {
    // Only manipulate the DOM if we're in a browser environment
    if (this.isBrowser) {
      // Add the enable-scroll class to body when this component initializes
      document.body.classList.add('enable-scroll', 'about-me-bg');
    }
  }

  ngOnDestroy(): void {
    // Only manipulate the DOM if we're in a browser environment
    if (this.isBrowser) {
      // Remove the enable-scroll class when navigating away from this component
      document.body.classList.remove('enable-scroll', 'about-me-bg');
    }
  }
  onSubmit() {
    const form = document.querySelector('form') as HTMLFormElement;

    emailjs.sendForm(
      'service_21n6w0h',      // Replace with your Service ID
      'template_p5kbegr',     // Replace with your Template ID
      form,
      'WyDp_2_IgVVq2GZDm'          // Replace with your User/Public Key
    ).then(
      () => {
        alert('Message sent successfully! 💌');
        form.reset();
      },
      (error) => {
        alert('Oops! Something went wrong. ❌');
        console.error(error);
      }
    );
  }
}
