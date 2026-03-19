// ========================
// Configuration
// ========================

const API_BASE_URL = 'http://127.0.0.1:8000';

// ========================
// Utility Functions
// ========================

async function apiCall(method, endpoint, data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function showMessage(containerId, message, type = 'success') {
    const messageEl = document.getElementById(containerId);
    messageEl.textContent = message;
    messageEl.className = `alert alert-${type}`;
    messageEl.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    document.querySelectorAll('.form-input, .form-textarea').forEach(el => {
        el.classList.remove('error');
    });
}

function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + 'Error');
    if (field && errorEl) {
        field.classList.add('error');
        errorEl.textContent = message;
    }
}

// ========================
// Form Validation
// ========================

function validateClaimForm(formData) {
    clearErrors();
    let isValid = true;

    // Policy Number validation
    if (!formData.policy_number.trim()) {
        setFieldError('policyNumber', 'Policy number is required');
        isValid = false;
    } else if (formData.policy_number.trim().length < 3) {
        setFieldError('policyNumber', 'Policy number must be at least 3 characters');
        isValid = false;
    }

    // Claimant Name validation
    if (!formData.claimant_name.trim()) {
        setFieldError('claimantName', 'Claimant name is required');
        isValid = false;
    } else if (formData.claimant_name.trim().length < 2) {
        setFieldError('claimantName', 'Name must be at least 2 characters');
        isValid = false;
    }

    // Incident Type validation
    if (!formData.incident_type) {
        setFieldError('incidentType', 'Please select an incident type');
        isValid = false;
    }

    // Incident Description validation
    if (!formData.incident_description.trim()) {
        setFieldError('incidentDescription', 'Description is required');
        isValid = false;
    } else if (formData.incident_description.trim().length < 10) {
        setFieldError('incidentDescription', 'Description must be at least 10 characters');
        isValid = false;
    }

    // Claiming Amount validation
    if (!formData.claiming_amt || formData.claiming_amt <= 0) {
        setFieldError('claimingAmount', 'Amount must be greater than 0');
        isValid = false;
    }

    return isValid;
}

// ========================
// Claim Form Submission
// ========================

async function handleClaimSubmit(event) {
    event.preventDefault();

    const form = document.getElementById('claimForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageEl = document.getElementById('submitMessage');

    const formData = {
        policy_number: document.getElementById('policyNumber').value,
        claimant_name: document.getElementById('claimantName').value,
        incident_type: document.getElementById('incidentType').value,
        incident_description: document.getElementById('incidentDescription').value,
        claiming_amt: parseFloat(document.getElementById('claimingAmount').value)
    };

    if (!validateClaimForm(formData)) {
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const response = await apiCall('POST', '/claims/', formData);

        showMessage('submitMessage', `Claim submitted successfully! Claim ID: ${response.claim_id}`, 'success');
        form.reset();
        clearErrors();

        // Refresh the claims list
        await loadClaimsList();
    } catch (error) {
        showMessage('submitMessage', 'Error submitting claim. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Claim';
    }
}

// ========================
// Claims List Management
// ========================

let allClaims = [];
let currentFilter = 'all';

async function loadClaimsList() {
    try {
        allClaims = await apiCall('GET', '/admin/claims');
        renderClaimsList();
    } catch (error) {
        console.error('Error loading claims:', error);
        const claimsListEl = document.getElementById('claimsList');
        claimsListEl.innerHTML = `
            <div class="empty-state">
                <p>Error loading claims. Please refresh.</p>
            </div>
        `;
    }
}

function filterClaims() {
    if (currentFilter === 'all') {
        return allClaims;
    }
    return allClaims.filter(claim => claim.status === currentFilter);
}

function renderClaimsList() {
    const claimsListEl = document.getElementById('claimsList');
    const filtered = filterClaims();

    if (filtered.length === 0) {
        claimsListEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No claims found</p>
            </div>
        `;
        return;
    }

    claimsListEl.innerHTML = filtered.map(claim => `
        <div class="claim-item" onclick="openClaimModal('${claim.claim_id}')">
            <div class="claim-item-header">
                <div class="claim-item-id">Claim: ${claim.claim_id.substring(0, 8)}...</div>
                <div class="claim-status-badge status-${claim.status}">
                    ${claim.status.replace('_', ' ')}
                </div>
            </div>
            <div class="claim-item-content">
                <div class="claim-item-detail">
                    <div class="claim-item-label">Policy Number</div>
                    <div class="claim-item-value">${claim.policy_number}</div>
                </div>
                <div class="claim-item-detail">
                    <div class="claim-item-label">Claimant</div>
                    <div class="claim-item-value">${claim.claimant_name}</div>
                </div>
                <div class="claim-item-detail">
                    <div class="claim-item-label">Incident Type</div>
                    <div class="claim-item-value">${claim.incident_type}</div>
                </div>
                <div class="claim-item-detail">
                    <div class="claim-item-label">Amount</div>
                    <div class="claim-item-amount">${formatCurrency(claim.claiming_amt)}</div>
                </div>
            </div>
            <div style="border-top: 1px solid var(--gray); padding-top: var(--spacing-md); font-size: 12px; color: var(--secondary);">
                Settlement: ${formatCurrency(claim.settlement_amount)} | Confidence: ${(claim.confidence_score * 100).toFixed(0)}%
            </div>
        </div>
    `).join('');
}

// ========================
// Modal Management
// ========================

async function openClaimModal(claimId) {
    try {
        const claim = await apiCall('GET', `/admin/claims/${claimId}`);
        const modal = document.getElementById('claimModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = `Claim: ${claim.claim_id.substring(0, 8)}`;

        modalBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <strong>Policy Number:</strong>
                    <p>${claim.policy_number}</p>
                </div>
                <div>
                    <strong>Claimant Name:</strong>
                    <p>${claim.claimant_name}</p>
                </div>
                <div>
                    <strong>Incident Type:</strong>
                    <p>${claim.incident_type}</p>
                </div>
                <div>
                    <strong>Status:</strong>
                    <p><span class="claim-status-badge status-${claim.status}">${claim.status.replace('_', ' ')}</span></p>
                </div>
                <div>
                    <strong>Claiming Amount:</strong>
                    <p>${formatCurrency(claim.claiming_amt)}</p>
                </div>
                <div>
                    <strong>Settlement Amount:</strong>
                    <p>${formatCurrency(claim.settlement_amount)}</p>
                </div>
                <div style="grid-column: 1/-1;">
                    <strong>Incident Description:</strong>
                    <p>${claim.incident_description}</p>
                </div>
                <div>
                    <strong>Confidence Score:</strong>
                    <p>${(claim.confidence_score * 100).toFixed(2)}%</p>
                </div>
                <div>
                    <strong>Created:</strong>
                    <p>${formatDate(claim.created_at)}</p>
                </div>
            </div>

            <div style="border-top: 1px solid var(--gray); padding-top: 16px; margin-top: 16px;">
                <strong style="display: block; margin-bottom: 12px;">Processing Pipeline:</strong>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${Object.entries(claim.agent_status || {}).map(([agent, status]) => `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="width: 20px; height: 20px; border-radius: 50%; background-color: ${status === 'completed' ? 'var(--success)' : 'var(--gray)'}; display: inline-block;"></span>
                            <span>${agent.replace(/_/g, ' ').replace('agent', '').trim()}</span>
                            <span style="margin-left: auto; font-size: 12px; color: var(--secondary);">${status}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error loading claim:', error);
        alert('Error loading claim details');
    }
}

function closeClaimModal() {
    document.getElementById('claimModal').style.display = 'none';
}

// ========================
// Tab/Filter Management
// ========================

function setupTabFilters() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update filter and re-render
            currentFilter = btn.getAttribute('data-status');
            renderClaimsList();
        });
    });
}

// ========================
// Processing Flow Animation
// ========================

function animateProcessingFlow() {
    const stages = document.querySelectorAll('.flow-stage');
    let currentStage = 0;

    setInterval(() => {
        // Reset all stages
        stages.forEach(stage => {
            stage.classList.remove('completed', 'in-progress');
        });

        // Set completed stages
        for (let i = 0; i < currentStage; i++) {
            stages[i].classList.add('completed');
        }

        // Set in-progress stage
        if (currentStage < stages.length) {
            stages[currentStage].classList.add('in-progress');
        }

        // Update status text
        stages.forEach((stage, index) => {
            const statusEl = stage.querySelector('.flow-stage-status');
            if (index < currentStage) {
                statusEl.textContent = 'Completed';
                statusEl.className = 'flow-stage-status completed';
            } else if (index === currentStage) {
                statusEl.textContent = 'Processing';
                statusEl.className = 'flow-stage-status in-progress';
            } else {
                statusEl.textContent = 'Pending';
                statusEl.className = 'flow-stage-status pending';
            }
        });

        currentStage = (currentStage + 1) % (stages.length + 1);
    }, 1500);
}

// ========================
// Event Listeners
// ========================

document.addEventListener('DOMContentLoaded', () => {
    // Form submission
    const claimForm = document.getElementById('claimForm');
    if (claimForm) {
        claimForm.addEventListener('submit', handleClaimSubmit);
    }

    // Refresh button
    const refreshClaimsBtn = document.getElementById('refreshClaimsBtn');
    if (refreshClaimsBtn) {
        refreshClaimsBtn.addEventListener('click', loadClaimsList);
    }

    // Modal close buttons
    const closeModal = document.getElementById('closeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModal) {
        closeModal.addEventListener('click', closeClaimModal);
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeClaimModal);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('claimModal');
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeClaimModal();
            }
        });
    }

    // Setup tabs and load initial data
    setupTabFilters();
    loadClaimsList();
    animateProcessingFlow();
});
