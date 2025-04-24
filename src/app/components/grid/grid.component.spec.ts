import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { GridComponent } from './grid.component';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set game over', () => {
    component.gameOver = false;
    component['gridService'].freeTiles = jasmine.createSpy().and.returnValue([]);
    component['gridService'].hasMergesAvailable = jasmine.createSpy().and.returnValue(false);
    component.checkGameOver();
    expect(component.gameOver).toBeTrue();
  });

  it('should set flat grid after some time', fakeAsync(() => {
    component.flatGrid = [];
    component.setFlatGridWithDelay(['test-value'] as any, 1000);
    expect(component.flatGrid).toEqual([]);
    tick(1001);
    expect(component.flatGrid).toEqual(['test-value'] as any);
  }));

  it('should call a movement action', () => {
    const test = (code: string, action: string) => {
      component.move = jasmine.createSpy();
      component.action({ code } as any);
      expect(component.move).toHaveBeenCalledWith(action as any);
    };

    test('ArrowUp', 'up');
    test('KeyW', 'up');
    test('ArrowDown', 'down');
    test('KeyS', 'down');
    test('ArrowLeft', 'left');
    test('KeyA', 'left');
    test('ArrowRight', 'right');
    test('KeyD', 'right');
  });

  it('should call for a move', fakeAsync(() => {
    component.score = 0;
    component['gridService'].moveTile = jasmine.createSpy().and.returnValue({ changed: true, grid: [[]], score: 10, movements: [] });
    component.move('up');
    expect(component['gridService'].moveTile).toHaveBeenCalled();
    tick(1000);
    expect(component.score).toBe(10);
  }));
});
