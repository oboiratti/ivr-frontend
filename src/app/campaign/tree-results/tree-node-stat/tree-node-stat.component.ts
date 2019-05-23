import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js'
import { NodeStat } from '../../shared/campaign.models';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-tree-node-stat',
  templateUrl: './tree-node-stat.component.html',
  styleUrls: ['./tree-node-stat.component.scss']
})
export class TreeNodeStatComponent implements OnInit, AfterViewInit {

  @Input() stat: NodeStat
  interactionsBar = {}
  @ViewChild('interactionsCanvas') interactionsCanvas: ElementRef
  aggregatesBar = {}
  @ViewChild('aggregatesCanvas') aggregatesCanvas: ElementRef
  responsesPie = {}
  @ViewChild('responsesCanvas') responsesCanvas: ElementRef

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.interactionsBarChart()
    this.aggregatesBarChart()
    this.responsesPieChart()
  }

  private makeBarChart(obj: any, canvas: ElementRef, data: any, labels: any, bgColor?: string) {
    obj = new Chart(canvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: bgColor || '#00b300'
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            barPercentage: 0.5,
            barThickness: 30
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        responsive: true,
        maintainAspectRatio: false
      }
    })
  }

  private interactionsBarChart() {
    const data = []
    const labels = []
    this.stat.interactions.map(obj => {
      data.push(obj.subscribers)
      labels.push(this.formatDate(obj.date))
    })
    this.makeBarChart(this.interactionsBar, this.interactionsCanvas, data, labels, '#7800b3')
  }

  private aggregatesBarChart() {
    const agg = this.stat.aggregates
    const data = [agg.totalCalls, agg.completed, agg.failed, agg.hangup]
    const labels = ['Total Calls', 'Completed', 'Failed', 'Hangup']
    this.makeBarChart(this.aggregatesBar, this.aggregatesCanvas, data, labels, '#31b0d5')
  }

  private formatDate(date: Date) {
    return new Date(date).toLocaleString()
  }

  private responsesPieChart() {
        const data = []
        const labels = []
        this.stat.responseDetails.map(obj => {
          data.push(obj.responses)
          labels.push(obj.value)
        })
        this.responsesPie = new Chart(this.responsesCanvas.nativeElement, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: ['#008000', '#800000', '#d81d1e', '#a3a0fb']
              }
            ]
          },
          options: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10
              }
            },
            responsive: true,
            maintainAspectRatio: false
          }
        })
  }
}
