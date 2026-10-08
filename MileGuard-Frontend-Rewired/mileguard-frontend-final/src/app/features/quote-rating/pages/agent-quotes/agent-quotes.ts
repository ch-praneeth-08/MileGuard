import {
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  Quote as QuoteModel
} from '../../../../core/models/quote.models';

import {
  Quote
} from '../../services/quote';

@Component({
  selector: 'app-agent-quotes',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl:
    './agent-quotes.html',
  styleUrl:
    './agent-quotes.css'
})
export class AgentQuotes
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly quoteApi =
    inject(Quote);

  private customerProfileId:
    string | null = null;

  readonly quotes =
    signal<QuoteModel[]>([]);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(null);

  ngOnInit(): void {
    this.customerProfileId =
      this.route.snapshot
        .paramMap
        .get('customerId');

    if (!this.customerProfileId) {
      void this.router.navigate([
        '/agent/customers'
      ]);

      return;
    }

    this.loadQuotes();
  }

  retry(): void {
    this.loadQuotes();
  }

  startNewQuote(): void {
    if (!this.customerProfileId) {
      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'quotes',
      'start'
    ]);
  }

  openQuote(
    quote: QuoteModel
  ): void {
    if (!this.customerProfileId) {
      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'quotes',
      quote.quoteId
    ]);
  }

  backToCustomer(): void {
    if (!this.customerProfileId) {
      void this.router.navigate([
        '/agent/customers'
      ]);

      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId
    ]);
  }

  activeQuote():
  QuoteModel | null {
  return (
    this.quotes()
      .find(
        quote =>
          quote.status === 'Draft'
      ) ??
    null
  );
}

  historicalQuotes():
    QuoteModel[] {
    const activeQuoteId =
      this.activeQuote()?.quoteId;

    return this.quotes()
      .filter(
        quote =>
          quote.quoteId !==
          activeQuoteId
      );
  }

  quoteActionLabel(
    quote: QuoteModel
  ): string {
    switch (quote.status) {
      case 'Draft':
        return 'Continue Quote';

      case 'Finalized':
        return 'Review Quote';

      case 'Submitted':
        return 'View Quote';

      case 'Expired':
        return 'View History';

      default:
        return 'View Quote';
    }
  }

  statusClasses(
    status: string
  ): string {
    switch (status) {
      case 'Finalized':
        return 'bg-green-50 text-green-700';

      case 'Submitted':
        return 'bg-blue-50 text-blue-700';

      case 'Expired':
        return 'bg-zinc-100 text-zinc-600';

      case 'Draft':
        return 'bg-zinc-100 text-zinc-700';

      default:
        return 'bg-zinc-100 text-zinc-700';
    }
  }

  private loadQuotes(): void {
    if (!this.customerProfileId) {
      return;
    }

    this.errorMessage.set(null);

    this.isLoading.set(true);

    this.quoteApi
      .getCustomerQuotes(
        this.customerProfileId
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: quotes => {
          this.quotes.set(
            quotes
          );
        },

        error: error => {
          this.quotes.set([]);

          if (error?.status === 403) {
            this.errorMessage.set(
              'This Customer is not assigned to your Agent account.'
            );

            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              'The Customer could not be found.'
            );

            return;
          }

          if (error?.status === 503) {
            this.errorMessage.set(
              'Customer information is temporarily unavailable. Please try again.'
            );

            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'Quotes could not be loaded. Please try again.'
          );
        }
      });
  }
}
