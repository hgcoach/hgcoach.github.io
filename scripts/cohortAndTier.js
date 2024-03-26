// jshint esversion: 6

function getDefaultCohort() {
    return localStorage.getItem('cohort');
}

function storeDefaultCohort(cohortElement) {
    let selection;

    try {
        selection = cohortElement.value;
    } catch (error) {
        if (!error.message.includes('is null')) {
            throw error;
        }

        selection = null;
    }

    const oldCohort = getDefaultCohort();
    localStorage.setItem('cohort', selection);
    outputStorageUpdate('cohort', oldCohort);
}

function getDefaultTier() {
    return localStorage.getItem('tier');
}

function storeDefaultTier(tierElement) {
    let selection;

    try {
        selection = tierElement.value;
    } catch (error) {
        if (!error.message.includes('is null')) {
            throw error;
        }

        selection = null;
    }

    const oldTier = getDefaultTier();
    localStorage.setItem('tier', selection);
    outputStorageUpdate('tier', oldTier);
}
