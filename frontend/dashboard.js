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
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// ========================
// Data Loading
// ========================

let allClaims = [];
let displayedClaims = [];

async function loadDashboard() {
    try {
        allClaims = await apiCall('GET', '/admin/claims');
        displayedClaims = [...allClaims];
        updateStatistics();
        renderClaimsTable();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px;">
                    <p style="color: var(--danger);">Error loading claims. Please refresh the page.</p>
                </td>
            </tr>
        `;
    }
}

// ========================
// Statistics
// ========================

function updateStatistics() {
    const stats = {
        submitted: allClaims.filter(c => c.status === 'submitted').length,
        processing: allClaims.filter(c => c.status === 'processing').length,
        human_review: allClaims.filter(c => c.status === 'human_review').length,
        approved: allClaims.filter(c => c.status === 'approved').length,
        rejected: allClaims.filter(c => c.status === 'rejected').length
    };

    document.getElementById('submittedCount').textContent = stats.submitted;
    document.getElementById('processingCount').textContent = stats.processing;
    document.getElementById('reviewCount').textContent = stats.human_review;
    document.getElementById('approvedCount').textContent = stats.approved;
    document.getElementById('rejectedCount').textContent = stats.rejected;
}

// ========================
// Table Rendering
// ========================

function renderClaimsTable() {
    const tableBody = document.getElementById('tableBody');

    if (displayedClaims.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px;">
                    <p style="color: var(--secondary);">No claims found</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = displayedClaims.map(claim => `
        <tr onclick="openClaimDetailsModal('${claim.claim_id}')" style="cursor: pointer;">
            <td>
                <strong style="color: var(--primary);">${claim.claim_id.substring(0, 8)}...</strong>
            </td>
            <td>${claim.policy_number}</td>
            <td>${claim.claimant_name}</td>
            <td>${claim.incident_type}</td>
            <td>${formatCurrency(claim.claiming_amt)}</td>
            <td>
                <span class="claim-status-badge status-${claim.status}">
                    ${claim.status.replace('_', ' ')}
                </span>
            </td>
            <td>
                <strong>${(claim.confidence_score * 100).toFixed(0)}%</strong>
            </td>
            <td>${formatCurrency(claim.settlement_amount)}</td>
            <td style="font-size: 12px;">${formatDate(claim.created_at)}</td>
            <td>
                <div class="table-actions">
                    ${claim.status === 'human_review' ? `
                        <button class="table-action-btn approve" onclick="approveClaim('${claim.claim_id}', event)">Approve</button>
                        <button class="table-action-btn reject" onclick="rejectClaim('${claim.claim_id}', event)">Reject</button>
                    ` : `
                        <button class="btn btn-sm btn-primary" onclick="viewClaimDetails('${claim.claim_id}', event)">View</button>
                    `}
                </div>
            </td>
        </tr>
    `).join('');
}

// ========================
// Search/Filter
// ========================

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            displayedClaims = allClaims.filter(claim =>
                claim.claim_id.toLowerCase().includes(query) ||
                claim.policy_number.toLowerCase().includes(query) ||
                claim.claimant_name.toLowerCase().includes(query)
            );
            renderClaimsTable();
        });
    }
}

// ========================
// Claim Actions
// ========================

async function approveClaim(claimId, event) {
    event.stopPropagation();

    if (!confirm('Are you sure you want to approve this claim?')) {
        return;
    }

    try {
        await apiCall('POST', `/admin/approve/${claimId}`);
        alert('Claim approved successfully!');
        loadDashboard();
    } catch (error) {
        console.error('Error approving claim:', error);
        alert('Error approving claim. Please try again.');
    }
}

async function rejectClaim(claimId, event) {
    event.stopPropagation();

    if (!confirm('Are you sure you want to reject this claim?')) {
        return;
    }

    try {
        await apiCall('POST', `/admin/reject/${claimId}`);
        alert('Claim rejected successfully!');
        loadDashboard();
    } catch (error) {
        console.error('Error rejecting claim:', error);
        alert('Error rejecting claim. Please try again.');
    }
}

async function viewClaimDetails(claimId, event) {
    event.stopPropagation();
    openClaimDetailsModal(claimId);
}

// ========================
// Modal Management
// ========================

async function openClaimDetailsModal(claimId) {
    try {
        const claim = await apiCall('GET', `/admin/claims/${claimId}`);
        const modal = document.getElementById('claimDetailsModal');
        const modalTitle = document.getElementById('detailsModalTitle');
        const modalBody = document.getElementById('detailsModalBody');

        modalTitle.textContent = `Claim Details: ${claim.claim_id.substring(0, 8)}...`;

        modalBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <label style="color: var(--secondary); font-size: 12px; text-transform: uppercase;">Claim ID</label>
                    <p style="font-weight: 600; margin: 4px 0 0 0;">${claim.claim_id}</p>
                </div>
                <div>
                    <label style="color: var(--secondary); font-size: 12px; text-transform: uppercase;">Policy Number</label>
                    <p style="font-weight: 600; margin: 4px 0 0 0;">${claim.policy_number}</p>
                </div>
                <div>
                    <label style="color: var(--secondary); font-size: 12px; text-transform: uppercase;">Claimant Name</label>
                    <p style="font-weight: 600; margin: 4px 0 0 0;">${claim.claimant_name}</p>
                </div>
                <div>
                    <label style="color: var(--secondary); font-size: 12px; text-transform: uppercase;">Incident Type</label>
                    <p style="font-weight: 600; margin: 4px 0 0 0;">${claim.incident_type}</p>
                </div>
                <div>
                    <label style="color: var(--secondary); font-size: 12px; text-transform: uppercase;">Status</label>
                    <p style="margin: 4px 0 0 0;">
                        <span class="claim-status-badge status-${claim.status}">
                            ${claim.status.replace('_', ' ')}
                        </span>
                    </p>
                </div>
                <div>
                    <label style="color: var(--secondary); font-size: 12px; text-transform: uppercase;">Created Date</label>
                    <p style="font-weight: 600; margin: 4px 0 0 0;">${formatDate(claim.created_at)}</p>
                </div>
                <div>
                    <label style="color: var(--secondary); font-size: 12px; text-transform: uppercase;">Claiming Amount</label>
                    <p style="font-weight: 600; margin: 4px 0 0 0; color: var(--primary); font-size: 18px;">
                        ${formatCurrency(claim.claiming_amt)}
                    </p>
                </div>
                <div>
                    <label style="color: var(--secondary); font-size: 12px; text-transform: uppercase;">Settlement Amount</label>
                    <p style="font-weight: 600; margin: 4px 0 0 0; color: var(--success); font-size: 18px;">
                        ${formatCurrency(claim.settlement_amount)}
                    </p>
                </div>
                <div>
                    <label style="color: var(--secondary); font-size: 12px; text-transform: uppercase;">Confidence Score</label>
                    <p style="font-weight: 600; margin: 4px 0 0 0; font-size: 18px;">
                        ${(claim.confidence_score * 100).toFixed(2)}%
                    </p>
                </div>
                <div style="grid-column: 1/-1;">
                    <label style="color: var(--secondary); font-size: 12px; text-transform: uppercase;">Incident Description</label>
                    <p style="margin: 8px 0 0 0; line-height: 1.6;">${claim.incident_description}</p>
                </div>
            </div>

            <div style="border-top: 1px solid var(--gray); padding-top: 16px; margin-top: 16px;">
                <label style="color: var(--secondary); font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 12px;">
                    Processing Pipeline Status
                </label>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${Object.entries(claim.agent_status || {}).map(([agent, status]) => {
                        const statusColor = status === 'completed' ? 'var(--success)' :
                                           status === 'in-progress' ? 'var(--primary)' :
                                           'var(--gray)';
                        const statusBgColor = status === 'completed' ? 'rgba(16, 185, 129, 0.1)' :
                                             status === 'in-progress' ? 'rgba(37, 99, 235, 0.1)' :
                                             'rgba(203, 213, 225, 0.1)';
                        return `
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span style="width: 24px; height: 24px; border-radius: 50%; background-color: ${statusColor}; display: inline-block;"></span>
                                <span style="flex: 1; font-weight: 500;">
                                    ${agent.replace(/_agent/g, '').replace(/_/g, ' ').toUpperCase()}
                                </span>
                                <span style="background-color: ${statusBgColor}; color: ${statusColor}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: capitalize;">
                                    ${status}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            ${claim.status === 'human_review' ? `
                <div style="border-top: 1px solid var(--gray); padding-top: 16px; margin-top: 16px; display: flex; gap: 12px;">
                    <button class="btn btn-success" onclick="approveClaim('${claim.claim_id}', event)" style="flex: 1;">
                        Approve Claim
                    </button>
                    <button class="btn btn-danger" onclick="rejectClaim('${claim.claim_id}', event)" style="flex: 1;">
                        Reject Claim
                    </button>
                </div>
            ` : ''}
        `;

        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error loading claim details:', error);
        alert('Error loading claim details. Please try again.');
    }
}

function closeClaimDetailsModal() {
    document.getElementById('claimDetailsModal').style.display = 'none';
}

// ========================
// Event Listeners
// ========================

document.addEventListener('DOMContentLoaded', () => {
    // Load dashboard data
    loadDashboard();

    // Setup search
    setupSearch();

    // Refresh button
    const refreshBtn = document.getElementById('refreshDashboardBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDashboard);
    }

    // Modal close buttons
    const closeDetailsModal = document.getElementById('closeDetailsModal');
    const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
    if (closeDetailsModal) {
        closeDetailsModal.addEventListener('click', closeClaimDetailsModal);
    }
    if (closeDetailsModalBtn) {
        closeDetailsModalBtn.addEventListener('click', closeClaimDetailsModal);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('claimDetailsModal');
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeClaimDetailsModal();
            }
        });
    }
});
