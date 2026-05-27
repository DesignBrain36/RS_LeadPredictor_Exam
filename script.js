document.addEventListener('DOMContentLoaded', () => {
    // Translations
    const translations = {
        en: {
            language: "Language",
            currency: "Currency",
            campaignStart: "Campaign Start",
            campaignEnd: "Campaign End",
            totalRevenue: "Total Revenue",
            avgOrderValue: "Avg. Order Value",
            prospects: "Prospects",
            leads: "Leads",
            customers: "Customers",
            leadResponseRate: "Lead Response Rate",
            prospectResponseRate: "Prospect Response Rate",
            people: "people",
            months: "Months",
            month: "Month"
        },
        bg: {
            language: "Език",
            currency: "Валута",
            campaignStart: "Начало на кампания",
            campaignEnd: "Край на кампания",
            totalRevenue: "Общи приходи",
            avgOrderValue: "Ср. стойност на поръчка",
            prospects: "Потенциални",
            leads: "Лийдове",
            customers: "Клиенти",
            leadResponseRate: "Честота на отговор (Лийдове)",
            prospectResponseRate: "Честота на отговор (Потенциални)",
            people: "души",
            months: "Месеци",
            month: "Месец"
        },
        de: {
            language: "Sprache",
            currency: "Währung",
            campaignStart: "Kampagnenstart",
            campaignEnd: "Kampagnenende",
            totalRevenue: "Gesamtumsatz",
            avgOrderValue: "Durchschn. Bestellwert",
            prospects: "Interessenten",
            leads: "Leads",
            customers: "Kunden",
            leadResponseRate: "Lead-Antwortrate",
            prospectResponseRate: "Interessenten-Antwortrate",
            people: "Personen",
            months: "Monate",
            month: "Monat"
        }
    };

    let currentLang = 'en';

    // Inputs
    const languageSelect = document.getElementById('language');
    const currencySelect = document.getElementById('currency');
    const currencySymbols = document.querySelectorAll('.currency-symbol');
    const totalRevenueInput = document.getElementById('total-revenue');
    const avgOrderValueInput = document.getElementById('avg-order-value');
    const leadRateInput = document.getElementById('lead-rate');
    const prospectRateInput = document.getElementById('prospect-rate');
    
    // Outputs
    const prospectsValue = document.getElementById('prospects-value');
    const leadsValue = document.getElementById('leads-value');
    const customersValue = document.getElementById('customers-value');
    
    const leadsPercent = document.getElementById('leads-percent');
    const customersPercent = document.getElementById('customers-percent');
    
    const leadsProgress = document.getElementById('leads-progress');
    const customersProgress = document.getElementById('customers-progress');

    const leadRateValDisp = document.getElementById('lead-rate-val');
    const prospectRateValDisp = document.getElementById('prospect-rate-val');

    function calculate() {
        // Values
        const totalRevenue = parseFloat(totalRevenueInput.value) || 0;
        const avgOrderValue = parseFloat(avgOrderValueInput.value) || 1; // avoid / 0
        const leadResponseRate = parseFloat(leadRateInput.value); 
        const prospectResponseRate = parseFloat(prospectRateInput.value); 

        leadRateValDisp.textContent = leadResponseRate.toFixed(2) + '%';
        prospectRateValDisp.textContent = prospectResponseRate.toFixed(2) + '%';

        // Formula 01: Customers = Revenue / Avg Order Value
        const customersCount = Math.ceil(totalRevenue / avgOrderValue);
        
        // Formula 02: Leads = Customers * 100 / Lead response rate
        const leadsCount = leadResponseRate > 0 ? Math.ceil((customersCount * 100) / leadResponseRate) : 0;
        
        // Formula 03: Prospects = Leads * 100 / Prospect response rate
        const prospectsCount = prospectResponseRate > 0 ? Math.ceil((leadsCount * 100) / prospectResponseRate) : 0;

        // UI Updates
        prospectsValue.textContent = prospectsCount;
        leadsValue.textContent = leadsCount;
        customersValue.textContent = customersCount;

        const leadsPrcnt = prospectsCount > 0 ? (leadsCount / prospectsCount) * 100 : 0;
        const customersPrcnt = prospectsCount > 0 ? (customersCount / prospectsCount) * 100 : 0;

        leadsPercent.textContent = Math.round(leadsPrcnt) + '%';
        customersPercent.textContent = Math.round(customersPrcnt) + '%';

        leadsProgress.style.width = Math.min(leadsPrcnt, 100) + '%';
        customersProgress.style.width = Math.min(customersPrcnt, 100) + '%';

        updateChart(prospectsCount, leadsCount, customersCount);
    }

    function updateChart(totProspects, totLeads, totCustomers) {
        const container = document.getElementById('chart-panel');
        container.innerHTML = ''; // clear previous

        const months = 6;
        const prospectData = [];
        const leadData = [];
        const customerData = [];
        
        for(let i=1; i<=months; i++) {
             const ratio = i / months; 
             prospectData.push(Math.round(totProspects * (ratio/3.5) * i));
             leadData.push(Math.round(totLeads * (ratio/3.5) * i));
             customerData.push(Math.round(totCustomers * (ratio/3.5) * i));
        }

        const maxVal = Math.max(...prospectData, 10);
        // We'll calculate nice x-axis ticks
        const maxTick = Math.ceil(maxVal / 20) * 20;

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-chart-wrapper';

        const mainArea = document.createElement('div');
        mainArea.className = 'custom-chart-main';

        // Y Axis Title
        const yTitle = document.createElement('div');
        yTitle.className = 'custom-chart-y-title';
        yTitle.innerText = translations[currentLang].months;
        mainArea.appendChild(yTitle);

        // Y Axis
        const yAxis = document.createElement('div');
        yAxis.className = 'custom-chart-y-axis';
        for(let i=1; i<=months; i++) {
            const yLabel = document.createElement('div');
            yLabel.className = 'custom-chart-y-label';
            yLabel.innerText = i;
            yAxis.appendChild(yLabel);
        }
        mainArea.appendChild(yAxis);

        // Grid & Bars
        const grid = document.createElement('div');
        grid.className = 'custom-chart-grid';

        // X Axis lines
        const xLines = document.createElement('div');
        xLines.className = 'custom-chart-grid-x-lines';
        const steps = 6;
        for(let i=0; i<=steps; i++) {
            const line = document.createElement('div');
            line.className = 'custom-chart-grid-x-line';
            xLines.appendChild(line);
        }
        grid.appendChild(xLines);

        // Rows
        for(let i=0; i<months; i++) {
            const row = document.createElement('div');
            row.className = 'custom-chart-row';
            
            const wProspects = (prospectData[i] / maxTick) * 100;
            const wLeads = (leadData[i] / maxTick) * 100;
            const wCustomers = (customerData[i] / maxTick) * 100;

            row.innerHTML = `
                <div class="custom-chart-bar prospects" style="width: ${wProspects}%"></div>
                <div class="custom-chart-bar leads" style="width: ${wLeads}%"></div>
                <div class="custom-chart-bar customers" style="width: ${wCustomers}%"></div>
                <div class="custom-chart-tooltip">
                    ${translations[currentLang].month} #${i+1}<br/>
                    ${translations[currentLang].prospects}: ${prospectData[i]}<br/>
                    ${translations[currentLang].leads}: ${leadData[i]}<br/>
                    ${translations[currentLang].customers}: ${customerData[i]}
                </div>
            `;
            grid.appendChild(row);
        }

        mainArea.appendChild(grid);
        wrapper.appendChild(mainArea);

        // X Axis Labels
        const xAxis = document.createElement('div');
        xAxis.className = 'custom-chart-x-axis';
        for(let i=0; i<=steps; i++) {
            const val = Math.round((maxTick / steps) * i);
            const xLabel = document.createElement('div');
            xLabel.className = 'custom-chart-x-label';
            if (i === 0) {
                xLabel.innerText = "0 " + translations[currentLang].people;
            } else {
                xLabel.innerText = val + ' ' + translations[currentLang].people;
            }
            xAxis.appendChild(xLabel);
        }
        wrapper.appendChild(xAxis);

        // Title/Legend
        const legend = document.createElement('div');
        legend.className = 'custom-chart-legend';
        legend.innerHTML = `
            <div class="legend-item"><div class="legend-color c-prospects"></div>${translations[currentLang].prospects}</div>
            <div class="legend-item"><div class="legend-color c-leads"></div>${translations[currentLang].leads}</div>
            <div class="legend-item"><div class="legend-color c-customers"></div>${translations[currentLang].customers}</div>
        `;
        wrapper.appendChild(legend);

        container.appendChild(wrapper);
    }

    // Event listeners
    languageSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        const t = translations[currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                el.innerText = t[key];
            }
        });
        
        calculate(); // Recalculate and re-render chart to update language labels
    });

    currencySelect.addEventListener('change', (e) => {
        const symbol = e.target.value;
        currencySymbols.forEach(el => {
            el.innerText = symbol;
        });
    });

    [totalRevenueInput, avgOrderValueInput, leadRateInput, prospectRateInput].forEach(el => {
        el.addEventListener('input', calculate);
    });

    calculate(); // Initial run
});