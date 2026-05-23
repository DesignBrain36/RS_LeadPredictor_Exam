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
                     barPercentage: 0.9,
                     categoryPercentage: 0.8,
                 },
                 {
                     label: translations[currentLang].leads,
                     data: leadData,
                     backgroundColor: '#8a99b2',
                     barPercentage: 0.6,
                     categoryPercentage: 0.8,
                 },
                 {
                     label: translations[currentLang].customers,
                     data: customerData,
                     backgroundColor: '#a6b4c9',
                     barPercentage: 0.3,
                     categoryPercentage: 0.8,
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
                            backgroundColor: 'rgba(96, 107, 130, 0.95)',
                            titleFont: { size: 14, weight: 'normal', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto' },
                            bodyFont: { size: 14, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto' },
                            cornerRadius: 0,
                            borderColor: '#d1d5db',
                            borderWidth: 1,
                            caretSize: 6,
                            padding: 10,
                            displayColors: false,
                            callbacks: {
                                title: (context) => {
                                    return translations[currentLang].month + ' #' + context[0].label;
                                },
                                label: (context) => {
                                    return context.dataset.label + ': ' + context.raw;
                                }
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