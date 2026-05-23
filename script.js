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

    let chartInstance = null;

    function calculate() {
        // Values
        const totalRevenue = parseFloat(totalRevenueInput.value) || 0;
        const avgOrderValue = parseFloat(avgOrderValueInput.value) || 1; // avoid / 0
        const leadResponseRate = parseFloat(leadRateInput.value) / 100; // 0 to 1
        const prospectResponseRate = parseFloat(prospectRateInput.value) / 100; // 0 to 1

        leadRateValDisp.textContent = parseFloat(leadRateInput.value).toFixed(2) + '%';
        prospectRateValDisp.textContent = parseFloat(prospectRateInput.value).toFixed(2) + '%';

        // Math
        // Customers = Revenue / Avg Order
        const customersCount = Math.floor(totalRevenue / avgOrderValue);
        
        // Leads = Customers / Lead Rate
        const leadsCount = leadResponseRate > 0 ? Math.floor(customersCount / leadResponseRate) : 0;
        
        // Prospects = Leads / Prospect Rate
        const prospectsCount = prospectResponseRate > 0 ? Math.floor(leadsCount / prospectResponseRate) : 0;

        // Ensure Prospects >= Leads >= Customers
        const adjCustomers = customersCount;
        const adjLeads = Math.max(leadsCount, customersCount);
        const adjProspects = Math.max(prospectsCount, adjLeads);

        // Update UI
        prospectsValue.textContent = adjProspects;
        leadsValue.textContent = adjLeads;
        customersValue.textContent = adjCustomers;

        const leadsPrcnt = adjProspects > 0 ? (adjLeads / adjProspects) * 100 : 0;
        const customersPrcnt = adjProspects > 0 ? (adjCustomers / adjProspects) * 100 : 0;

        leadsPercent.textContent = Math.round(leadsPrcnt) + '%';
        customersPercent.textContent = Math.round(customersPrcnt) + '%';

        leadsProgress.style.width = Math.min(leadsPrcnt, 100) + '%';
        customersProgress.style.width = Math.min(customersPrcnt, 100) + '%';

        updateChart(adjProspects, adjLeads, adjCustomers);
    }

    function generateChartData(totProspects, totLeads, totCustomers, months = 6) {
        // Simple linear distribution over 6 months
        const prospectData = [];
        const leadData = [];
        const customerData = [];
        
        // for making stacked horizontal bars like screenshot
        for(let i=1; i<=months; i++) {
             // In the screenshot, larger lists are at the bottom (Month 6).
             // Let's create an increasing pattern
             const ratio = i / months; 
             prospectData.push(Math.round(totProspects * (ratio/3.5) * i)); // Just generating increasing values
             leadData.push(Math.round(totLeads * (ratio/3.5) * i));
             customerData.push(Math.round(totCustomers * (ratio/3.5) * i));
        }

        // Based on the screenshot, Month 6 is lowest in chart visual, Month 1 is top
        // Let's flip it so Month 1 is top but smaller.
        // Actually screenshot: Month 6 has the biggest bar, Month 1 smallest.
        
        return {
             labels: ['1', '2', '3', '4', '5', '6'],
             datasets: [
                 {
                     label: translations[currentLang].prospects,
                     data: prospectData,
                     backgroundColor: '#6b7a91',
                     barPercentage: 0.8,
                     categoryPercentage: 0.9,
                 },
                 {
                     label: translations[currentLang].leads,
                     data: leadData,
                     backgroundColor: '#8a99b2',
                     barPercentage: 0.8,
                     categoryPercentage: 0.9,
                 },
                 {
                     label: translations[currentLang].customers,
                     data: customerData,
                     backgroundColor: '#a6b4c9',
                     barPercentage: 0.8,
                     categoryPercentage: 0.9,
                 }
             ]
        };
    }

    function updateChart(prospects, leads, customers) {
        const ctx = document.getElementById('predictionChart').getContext('2d');
        
        let data = generateChartData(prospects, leads, customers);

        if (chartInstance) {
            chartInstance.data = data;
            chartInstance.update();
        } else {
            Chart.defaults.color = '#7d8a9e';
            Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    indexAxis: 'y',
                    grouped: false, // Overlap the bars
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        x: {
                            stacked: false, 
                            title: {
                                display: true,
                                text: translations[currentLang].people,
                                padding: 0
                            },
                        },
                        y: {
                            stacked: false,
                            title: {
                                display: true,
                                text: translations[currentLang].months,
                            },
                            reverse: false
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                title: (context) => {
                                    return translations[currentLang].month + ' #' + context[0].label;
                                },
                            }
                        }
                    }
                }
            });
        }
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
        
        if (chartInstance) {
            chartInstance.data.datasets[0].label = t.prospects;
            chartInstance.data.datasets[1].label = t.leads;
            chartInstance.data.datasets[2].label = t.customers;
            chartInstance.options.scales.x.title.text = t.people;
            chartInstance.options.scales.y.title.text = t.months;
            chartInstance.update();
        }
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