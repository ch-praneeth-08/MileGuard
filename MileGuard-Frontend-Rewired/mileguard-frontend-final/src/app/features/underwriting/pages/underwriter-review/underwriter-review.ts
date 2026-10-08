import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe
} from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  finalize
} from 'rxjs';

import {
  AuthSession
} from '../../../../core/auth/auth-session';
import {
  MakeUnderwritingDecisionRequest,
  UnderwriterReview as UnderwriterReviewModel,
  UnderwriterReviewSection,
  UpdateReviewSectionRequest
} from '../../../../core/models/underwriting.models';
import {
  AuthApi
} from '../../../identity/services/auth-api';
import {
  UnderwritingApi
} from '../../services/underwriting-api';

type ReviewStep =
  | 'driver'
  | 'vehicle'
  | 'insurance-quote'
  | 'overall-risk'
  | 'decision';

@Component({
  selector: 'app-underwriter-review',
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule
  ],
  templateUrl:
    './underwriter-review.html',
  styleUrl:
    './underwriter-review.css'
})
export class UnderwriterReview
  implements OnInit {
  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly underwritingApi =
    inject(UnderwritingApi);

  private readonly authApi =
    inject(AuthApi);

  private readonly authSession =
    inject(AuthSession);

  readonly currentUser =
    this.authSession.currentUser;

  readonly application =
  signal<UnderwriterReviewModel | null>(
    null
  );

  readonly activeStep =
    signal<ReviewStep>('driver');

  readonly isLoading =
    signal(true);

  readonly isSaving =
    signal(false);

  readonly isDeciding =
    signal(false);

  readonly isLoggingOut =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly saveError =
    signal<string | null>(null);

  readonly successMessage =
    signal<string | null>(null);

  readonly showApproveConfirmation =
    signal(false);

  readonly showRejectConfirmation =
    signal(false);

  readonly notesControl =
    new FormControl<string>('', {
      nonNullable: true
    });

  readonly reviewedControl =
    new FormControl<boolean>(
      false,
      {
        nonNullable: true
      }
    );

  readonly rejectionReasonControl =
    new FormControl<string>('', {
      nonNullable: true
    });

  readonly reviewSteps:
    ReadonlyArray<{
      key: ReviewStep;
      label: string;
    }> = [
      {
        key: 'driver',
        label: 'Driver'
      },
      {
        key: 'vehicle',
        label: 'Vehicle'
      },
      {
        key: 'insurance-quote',
        label: 'Insurance / Quote'
      },
      {
        key: 'overall-risk',
        label: 'Overall Risk'
      },
      {
        key: 'decision',
        label: 'Decision'
      }
    ];

  readonly completedReviewCount =
    computed(() =>
      this.application()
        ?.reviewSections
        .filter(
          section =>
            section.reviewed
        )
        .length ?? 0
    );

  readonly allSectionsReviewed =
    computed(
      () =>
        this.completedReviewCount() ===
        4
    );

  readonly isCompleted =
    computed(() => {
      const status =
        this.normalizedStatus(
          this.application()
            ?.status ?? ''
        );

      return (
        status === 'approved' ||
        status === 'rejected' ||
        status === 'declined' ||
        status === 'lapsed'
      );
    });

  readonly isEditable =
    computed(
      () =>
        !this.isCompleted() &&
        this.normalizedStatus(
          this.application()
            ?.status ?? ''
        ) === 'inreview'
    );

  readonly currentSection =
    computed(() => {
      const application =
        this.application();

      const step =
        this.activeStep();

      if (
        !application ||
        step === 'decision'
      ) {
        return null;
      }

      return (
        application.reviewSections.find(
          section =>
            this.sectionKey(
              section.sectionType
            ) === step
        ) ?? null
      );
    });

  readonly activeStepIndex =
    computed(() =>
      this.reviewSteps.findIndex(
        step =>
          step.key ===
          this.activeStep()
      )
    );

  readonly riskPosition =
    computed(() => {
      const risk =
        this.application()
          ?.quote
          .overallRiskRating
          .trim()
          .toLowerCase();

      switch (risk) {
        case 'low':
          return 16.5;

        case 'moderate':
        case 'medium':
          return 50;

        case 'high':
          return 83.5;

        default:
          return 50;
      }
    });

  ngOnInit(): void {
    this.loadReview();
  }

  retry(): void {
    this.loadReview();
  }

  selectStep(
    step: ReviewStep
  ): void {
    this.saveError.set(null);
    this.successMessage.set(null);

    this.activeStep.set(step);

    if (step !== 'decision') {
      this.syncSectionForm();
    }
  }

  previousStep(): void {
    const currentIndex =
      this.activeStepIndex();

    if (currentIndex <= 0) {
      return;
    }

    this.selectStep(
      this.reviewSteps[
        currentIndex - 1
      ].key
    );
  }

  nextStep(): void {
    const currentIndex =
      this.activeStepIndex();

    if (
      currentIndex < 0 ||
      currentIndex >=
        this.reviewSteps.length - 1
    ) {
      return;
    }

    this.selectStep(
      this.reviewSteps[
        currentIndex + 1
      ].key
    );
  }

  saveAndContinue(): void {
    const application =
      this.application();

    const step =
      this.activeStep();

    if (
      !application ||
      step === 'decision' ||
      !this.isEditable() ||
      this.isSaving()
    ) {
      return;
    }

    const request:
      UpdateReviewSectionRequest = {
      reviewed:
        this.reviewedControl.value,
      notes:
        this.cleanOptionalText(
          this.notesControl.value
        )
    };

    this.isSaving.set(true);
    this.saveError.set(null);
    this.successMessage.set(null);

    this.updateSection(
      application.applicationId,
      step,
      request
    )
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        })
      )
      .subscribe({
        next: section => {
          this.replaceReviewSection(
            section
          );

          this.successMessage.set(
            'Review section saved.'
          );

          this.nextStep();
        },

        error: error => {
          if (error?.status === 403) {
            this.saveError.set(
              'This application is not assigned to your account.'
            );
            return;
          }

          if (error?.status === 404) {
            this.saveError.set(
              error?.error?.message ??
              'The Underwriting application could not be found.'
            );
            return;
          }

          if (error?.status === 409) {
            this.saveError.set(
              error?.error?.message ??
              'The application state has changed. Reload the review before continuing.'
            );
            return;
          }

          this.saveError.set(
            error?.error?.message ??
            'The review section could not be saved. Your input has been preserved.'
          );
        }
      });
  }

  openApproveConfirmation():
    void {
    if (
      !this.allSectionsReviewed() ||
      !this.isEditable() ||
      this.isDeciding()
    ) {
      return;
    }

    this.saveError.set(null);
    this.showApproveConfirmation.set(
      true
    );
  }

  closeApproveConfirmation():
    void {
    if (this.isDeciding()) {
      return;
    }

    this.showApproveConfirmation.set(
      false
    );
  }

  confirmApprove(): void {
    const application =
      this.application();

    if (
      !application ||
      !this.allSectionsReviewed() ||
      this.isDeciding()
    ) {
      return;
    }

    const request:
      MakeUnderwritingDecisionRequest = {
      decision: 'Approved',
      rejectionReason: null
    };

    this.submitDecision(
      application.applicationId,
      request
    );
  }

  openRejectConfirmation():
    void {
    if (
      !this.allSectionsReviewed() ||
      !this.isEditable() ||
      this.isDeciding()
    ) {
      return;
    }

    this.saveError.set(null);
    this.rejectionReasonControl.setValue(
      ''
    );
    this.showRejectConfirmation.set(
      true
    );
  }

  closeRejectConfirmation():
    void {
    if (this.isDeciding()) {
      return;
    }

    this.showRejectConfirmation.set(
      false
    );
  }

  confirmReject(): void {
    const application =
      this.application();

    const reason =
      this.rejectionReasonControl
        .value
        .trim();

    if (!reason) {
      this.saveError.set(
        'Enter the customer-visible rejection reason before confirming rejection.'
      );
      return;
    }

    if (
      !application ||
      !this.allSectionsReviewed() ||
      this.isDeciding()
    ) {
      return;
    }

    const request:
      MakeUnderwritingDecisionRequest = {
      decision: 'Rejected',
      rejectionReason: reason
    };

    this.submitDecision(
      application.applicationId,
      request
    );
  }

  returnToApplications(): void {
    void this.router.navigate([
      '/underwriter/applications'
    ]);
  }

  isStepReviewed(
    step: ReviewStep
  ): boolean {
    if (step === 'decision') {
      return this.allSectionsReviewed();
    }

    const application =
      this.application();

    if (!application) {
      return false;
    }

    return (
      application.reviewSections
        .find(
          section =>
            this.sectionKey(
              section.sectionType
            ) === step
        )
        ?.reviewed ?? false
    );
  }

  stepClasses(
    step: ReviewStep
  ): string {
    if (
      this.activeStep() === step
    ) {
      return 'border-blue-500 bg-blue-50 text-blue-700';
    }

    if (this.isStepReviewed(step)) {
      return 'border-green-200 bg-green-50 text-green-700';
    }

    return 'border-[var(--color-border)] bg-white text-zinc-500';
  }

  statusClasses(
    status: string
  ): string {
    switch (
      this.normalizedStatus(status)
    ) {
      case 'pendingreview':
        return 'bg-amber-50 text-amber-700';

      case 'inreview':
        return 'bg-blue-50 text-blue-700';

      case 'approved':
        return 'bg-green-50 text-green-700';

      case 'rejected':
        return 'bg-red-50 text-red-700';

      case 'declined':
      case 'lapsed':
        return 'bg-zinc-100 text-zinc-600';

      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  }

  riskClasses(
    riskRating: string
  ): string {
    switch (
      riskRating
        .trim()
        .toLowerCase()
    ) {
      case 'low':
        return 'bg-green-50 text-green-700';

      case 'moderate':
      case 'medium':
        return 'bg-amber-50 text-amber-700';

      case 'high':
        return 'bg-red-50 text-red-700';

      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  }

  logout(): void {
    if (this.isLoggingOut()) {
      return;
    }

    this.isLoggingOut.set(true);

    this.authApi
      .logout()
      .pipe(
        finalize(() => {
          this.isLoggingOut.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.authSession.clear();

          void this.router.navigate([
            '/login'
          ]);
        },

        error: () => {
          this.authSession.clear();

          void this.router.navigate([
            '/login'
          ]);
        }
      });
  }

  private loadReview(): void {
    const applicationId =
      this.route.snapshot.paramMap.get(
        'applicationId'
      );

    if (!applicationId) {
      this.isLoading.set(false);
      this.errorMessage.set(
        'Underwriting application ID is missing.'
      );
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.saveError.set(null);
    this.successMessage.set(null);

    this.underwritingApi
      .getUnderwriterReview(
        applicationId
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: application => {
          this.application.set(
            application
          );

          this.activeStep.set(
            'driver'
          );

          this.syncSectionForm();
        },

        error: error => {
          this.application.set(null);

          if (error?.status === 403) {
            this.errorMessage.set(
              'This application is not assigned to your Underwriter account.'
            );
            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              error?.error?.message ??
              'The Underwriting application could not be found.'
            );
            return;
          }

          if (error?.status === 409) {
            this.errorMessage.set(
              error?.error?.message ??
              'This application is not currently available for review.'
            );
            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'The Underwriting review could not be loaded. Please try again.'
          );
        }
      });
  }

  private syncSectionForm(): void {
    const section =
      this.currentSection();

    this.reviewedControl.setValue(
      section?.reviewed ?? false,
      {
        emitEvent: false
      }
    );

    this.notesControl.setValue(
      section?.notes ?? '',
      {
        emitEvent: false
      }
    );
  }

  private updateSection(
    applicationId: string,
    step: Exclude<
      ReviewStep,
      'decision'
    >,
    request:
      UpdateReviewSectionRequest
  ) {
    switch (step) {
      case 'driver':
        return this.underwritingApi
          .updateDriverReview(
            applicationId,
            request
          );

      case 'vehicle':
        return this.underwritingApi
          .updateVehicleReview(
            applicationId,
            request
          );

      case 'insurance-quote':
        return this.underwritingApi
          .updateInsuranceQuoteReview(
            applicationId,
            request
          );

      case 'overall-risk':
        return this.underwritingApi
          .updateOverallRiskReview(
            applicationId,
            request
          );
    }
  }

  private replaceReviewSection(
    updatedSection:
      UnderwriterReviewSection
  ): void {
    const application =
      this.application();

    if (!application) {
      return;
    }

    const reviewSections =
      application.reviewSections
        .map(section =>
          section.sectionId ===
          updatedSection.sectionId
            ? updatedSection
            : section
        );

    this.application.set({
      ...application,
      reviewSections
    });
  }

  private submitDecision(
    applicationId: string,
    request:
      MakeUnderwritingDecisionRequest
  ): void {
    this.isDeciding.set(true);
    this.saveError.set(null);

    this.underwritingApi
      .makeDecision(
        applicationId,
        request
      )
      .pipe(
        finalize(() => {
          this.isDeciding.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.showApproveConfirmation.set(
            false
          );

          this.showRejectConfirmation.set(
            false
          );

          void this.router.navigate([
            '/underwriter/applications'
          ]);
        },

        error: error => {
          this.showApproveConfirmation.set(
            false
          );

          this.showRejectConfirmation.set(
            false
          );

          if (error?.status === 403) {
            this.saveError.set(
              'This application is not assigned to your account.'
            );
            return;
          }

          if (error?.status === 404) {
            this.saveError.set(
              error?.error?.message ??
              'The Underwriting application could not be found.'
            );
            return;
          }

          if (error?.status === 409) {
            this.saveError.set(
              error?.error?.message ??
              'The application state has changed or the review is incomplete. Reload before making a decision.'
            );
            return;
          }

          this.saveError.set(
            error?.error?.message ??
            'The Underwriting decision could not be recorded.'
          );
        }
      });
  }

  private sectionKey(
    sectionType: string
  ): Exclude<
    ReviewStep,
    'decision'
  > | null {
    const normalized =
      sectionType
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '');

    switch (normalized) {
      case 'driver':
        return 'driver';

      case 'vehicle':
        return 'vehicle';

      case 'insurancequote':
        return 'insurance-quote';

      case 'overallrisk':
        return 'overall-risk';

      default:
        return null;
    }
  }

  private normalizedStatus(
    status: string
  ): string {
    return status
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');
  }

  private cleanOptionalText(
    value: string
  ): string | null {
    const trimmed =
      value.trim();

    return trimmed.length > 0
      ? trimmed
      : null;
  }
}
