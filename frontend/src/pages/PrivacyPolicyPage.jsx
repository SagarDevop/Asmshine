import React from 'react';
import { LegalPolicyPage } from './LegalPolicyPage';

export const PrivacyPolicyPage = () => {
  return (
    <LegalPolicyPage
      policyType="privacy_policy"
      fallbackTitle="Privacy Policy"
    />
  );
};
export default PrivacyPolicyPage;

