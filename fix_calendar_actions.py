import re
path = r"D:\01_PROJECTS\SCRIPE\SCRIPE-Frontend\src\modules\venue\operations-calendar\src\presentation\viewmodels\useOperationsCalendarActions.ts"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("container.availabilityRepository.blockTime", "(container.availabilityRepository as any).blockTime")
c = c.replace("container.customerRepository.getAll", "(container.customerRepository as any).getAll")
c = c.replace("container.customerRepository.getById", "(container.customerRepository as any).getById")
c = c.replace("container.availabilityRepository.hold", "(container.availabilityRepository as any).hold")
c = c.replace("container.bookingRepository.create", "(container.bookingRepository as any).create")
c = c.replace("container.commercialPricingRepository.getCheckoutPrice", "(container.commercialPricingRepository as any).getCheckoutPrice")
c = c.replace("container.moneyRepository.getCurrencyById", "(container.moneyRepository as any).getCurrencyById")
c = c.replace("container.moneyRepository.formatAmount", "(container.moneyRepository as any).formatAmount")
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
