"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomDateTimePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    label?: string
}

export function CustomDateTimePicker({ date, setDate, label }: CustomDateTimePickerProps) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date())

    // Initialize with current time rounded to nearest 30 minutes
    const getCurrentTime = () => {
        const now = new Date()
        const minutes = now.getMinutes()
        const roundedMinutes = minutes < 30 ? 30 : 0
        const roundedHours = minutes < 30 ? now.getHours() : now.getHours() + 1

        // Convert to 12-hour format
        const hour12 = roundedHours % 12 || 12
        const period = roundedHours >= 12 ? 'PM' : 'AM'
        return `${hour12}:${roundedMinutes.toString().padStart(2, '0')} ${period}`
    }

    const [selectedTime, setSelectedTime] = React.useState(getCurrentTime())

    // Generate time slots in 12-hour format
    const timeSlots = React.useMemo(() => {
        const slots = []
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j += 30) {
                const hour12 = i % 12 || 12
                const minute = j.toString().padStart(2, '0')
                const period = i >= 12 ? 'PM' : 'AM'
                slots.push(`${hour12}:${minute} ${period}`)
            }
        }
        return slots
    }, [])

    // Update time when date changes
    React.useEffect(() => {
        if (date) {
            const hours = date.getHours()
            const minutes = date.getMinutes()
            const hour12 = hours % 12 || 12
            const period = hours >= 12 ? 'PM' : 'AM'
            setSelectedTime(`${hour12}:${minutes.toString().padStart(2, '0')} ${period}`)
        }
    }, [date])

    // Get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        return { daysInMonth, startingDayOfWeek, year, month }
    }

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

    // Generate calendar grid
    const calendarDays = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        calendarDays.push({
            day: prevMonthLastDay - i,
            isCurrentMonth: false,
            date: new Date(year, month - 1, prevMonthLastDay - i)
        })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({
            day: i,
            isCurrentMonth: true,
            date: new Date(year, month, i)
        })
    }

    // Next month days to fill the grid
    const remainingDays = 42 - calendarDays.length
    for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({
            day: i,
            isCurrentMonth: false,
            date: new Date(year, month + 1, i)
        })
    }

    // Convert 12-hour time to 24-hour for Date object
    const parseTime12to24 = (time12: string) => {
        const [time, period] = time12.split(' ')
        const [hourStr, minuteStr] = time.split(':')
        let hours = parseInt(hourStr)
        const minutes = parseInt(minuteStr)

        if (period === 'PM' && hours !== 12) {
            hours += 12
        } else if (period === 'AM' && hours === 12) {
            hours = 0
        }

        return { hours, minutes }
    }

    const handleDateSelect = (selectedDate: Date) => {
        // Check if selected date is a future date (not today)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const checkDate = new Date(selectedDate)
        checkDate.setHours(0, 0, 0, 0)

        // If it's a future date, default to 9am
        let timeToUse = selectedTime
        if (checkDate > today) {
            timeToUse = "9:00 AM"
            setSelectedTime("9:00 AM")
        }

        const { hours, minutes } = parseTime12to24(timeToUse)
        selectedDate.setHours(hours, minutes)
        setDate(selectedDate)
    }

    const handleTimeChange = (time: string) => {
        setSelectedTime(time)
        if (date) {
            const { hours, minutes } = parseTime12to24(time)
            const newDate = new Date(date)
            newDate.setHours(hours, minutes)
            setDate(newDate)
        }
    }

    const isToday = (checkDate: Date) => {
        const today = new Date()
        return checkDate.getDate() === today.getDate() &&
            checkDate.getMonth() === today.getMonth() &&
            checkDate.getFullYear() === today.getFullYear()
    }

    const isPastDate = (checkDate: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const compareDate = new Date(checkDate)
        compareDate.setHours(0, 0, 0, 0)
        return compareDate < today
    }

    const isSelected = (checkDate: Date) => {
        if (!date) return false
        return checkDate.getDate() === date.getDate() &&
            checkDate.getMonth() === date.getMonth() &&
            checkDate.getFullYear() === date.getFullYear()
    }

    const formatDisplayDate = () => {
        if (!date) return label || "Pick a date"
        const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        return `${dateStr} ${timeStr}`
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDisplayDate()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                    {/* Month/Year Header */}
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="font-semibold">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="h-9 flex items-center justify-center text-sm font-medium text-muted-foreground">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleDateSelect(item.date)}
                                disabled={!item.isCurrentMonth || isPastDate(item.date)}
                                className={cn(
                                    "h-9 w-9 rounded-md text-sm flex items-center justify-center transition-colors",
                                    item.isCurrentMonth && !isPastDate(item.date)
                                        ? "hover:bg-accent hover:text-accent-foreground"
                                        : "text-muted-foreground opacity-50 cursor-not-allowed",
                                    isSelected(item.date) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                                    isToday(item.date) && !isSelected(item.date) && "bg-accent text-accent-foreground"
                                )}
                            >
                                {item.day}
                            </button>
                        ))}
                    </div>

                    {/* Time Selector */}
                    <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Select value={selectedTime} onValueChange={handleTimeChange}>
                                <SelectTrigger className="w-full h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" className="max-h-60">
                                    {timeSlots.map(time => (
                                        <SelectItem key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
