import React from 'react';
import { useApp } from './context/AppContext';
import { DemoRoleBar, Header } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { PublicIntakeView } from './views/PublicIntakeView';
import { AuthenticatorView } from './views/AuthenticatorView';
import { OversightDashboardView } from './views/OversightDashboardView';
import { PartnerManagementView } from './views/PartnerManagementView';
import { AuditTrailView } from './views/AuditTrailView';
import { ConsortiumDashboardView } from './views/ConsortiumDashboardView';
import { TrackBuilderView } from './views/TrackBuilderView';
import { TrainerHubView } from './views/TrainerHubView';
import { EvaluationWorkspaceView } from './views/EvaluationWorkspaceView';
import { TraineeDashboardView } from './views/TraineeDashboardView';
import { LiveClassroomView } from './views/LiveClassroomView';
import { TimedAssessmentView } from './views/TimedAssessmentView';
import { CertificateIssuanceView } from './views/CertificateIssuanceView';

import { AIControlCenterView } from './views/AIControlCenterView';
import { KanbanView } from './views/KanbanView';
import { QuestionBankView } from './views/QuestionBankView';
import { IntegrationsView } from './views/IntegrationsView';
import { UserManagementView } from './views/UserManagementView';
import { SecurityView } from './views/SecurityView';

import { LandingPageView } from './views/LandingPageView';
import { SignInView } from './views/SignInView';
import { TwoFactorVerifyView } from './views/TwoFactorVerifyView';
import { OnboardingWalkthroughView } from './views/OnboardingWalkthroughView';

const VIEW_MAP = {
  "landing-page": LandingPageView,
  "sign-in": SignInView,
  "2fa-verify": TwoFactorVerifyView,
  "onboarding": OnboardingWalkthroughView,
  "public-intake": PublicIntakeView,
  "authenticator": AuthenticatorView,
  "admin-oversight": OversightDashboardView,
  "admin-partners": PartnerManagementView,
  "admin-audit": AuditTrailView,
  "consortium-dashboard": ConsortiumDashboardView,
  "curriculum-builder": TrackBuilderView,
  "trainer-hub": TrainerHubView,
  "trainer-grading": EvaluationWorkspaceView,
  "trainee-dashboard": TraineeDashboardView,
  "trainee-classroom": LiveClassroomView,
  "trainee-assessment": TimedAssessmentView,
  "trainee-certificate": CertificateIssuanceView,
  "ai-control": AIControlCenterView,
  "curriculum-kanban": KanbanView,
  "question-bank": QuestionBankView,
  "integrations": IntegrationsView,
  "user-management": UserManagementView,
  "security": SecurityView
};

export const AppContent = () => {
  const { currentView, isAuthenticated, showDemoBar } = useApp();
  const ActiveViewComponent = VIEW_MAP[currentView] || LandingPageView;

  const publicViews = ["landing-page", "sign-in", "2fa-verify", "public-intake", "authenticator"];
  const isPublicPage = publicViews.includes(currentView) || !isAuthenticated;

  return (
    <div className={`app-wrapper ${showDemoBar ? "has-demo-bar" : ""}`}>
      {showDemoBar && <DemoRoleBar />}
      <div className="app-layout">
        {!isPublicPage && <Sidebar />}
        <main
          className="app-main"
          style={{
            marginLeft: isPublicPage ? 0 : undefined,
            width: isPublicPage ? "100%" : undefined,
            padding: isPublicPage ? 0 : undefined
          }}
        >
          {!isPublicPage && <Header />}
          <ActiveViewComponent />
        </main>
      </div>
    </div>
  );
};

export default AppContent;
